import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import type { EstadoZona } from '../api';
import { CAPAS_GIBS, crearCapaGibs, type CapaGibs } from '../mapa/capaSatelital';
import { estiloNivel } from '../niveles';

interface Props {
  zonas: EstadoZona[];
  seleccionadaId: string | null;
  onSeleccionar: (zonaId: string) => void;
}

// Marcador del mapa (DESIGN.md sección 7): círculo de 28 px con el color del
// nivel dentro de un área táctil de 44 px, etiqueta píldora debajo.
function iconoZona(zona: EstadoZona, seleccionada: boolean): L.DivIcon {
  const estilo = estiloNivel(zona.nivel);
  const clases = ['yaku-marcador'];
  if (seleccionada) clases.push('yaku-marcador--seleccionado');
  if (zona.nivel === null) clases.push('yaku-marcador--sin-dato');
  return L.divIcon({
    className: 'yaku-marcador-envoltorio',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html:
      `<span class="${clases.join(' ')}">` +
      `<span class="yaku-marcador-punto" style="background:${estilo.fondo}"></span>` +
      `<span class="yaku-marcador-etiqueta">${zona.nombre} · ${estilo.etiqueta}</span>` +
      `</span>`,
  });
}

const etiquetaAccesible = (zona: EstadoZona) => `${zona.nombre}, nivel ${estiloNivel(zona.nivel).etiqueta}`;

const RIESGO: Record<string, number> = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };

// Las zonas de la Quebrada están muy juntas: con poco zoom las etiquetas se
// pisan. Se muestran en orden de prioridad (seleccionada, después mayor riesgo)
// y se oculta toda etiqueta que choque con una ya mostrada. El punto y su
// aria-label quedan siempre; al acercar el mapa reaparecen las etiquetas.
function acomodarEtiquetas(
  contenedor: HTMLElement | null,
  marcadores: Map<string, L.Marker>,
  zonas: EstadoZona[],
  seleccionadaId: string | null,
) {
  const prioridad = (z: EstadoZona) => (z.zonaId === seleccionadaId ? 10 : (RIESGO[z.nivel ?? ''] ?? 0));
  const ordenadas = zonas
    .map((z, i) => ({ z, i }))
    .sort((a, b) => prioridad(b.z) - prioridad(a.z) || a.i - b.i)
    .map(({ z }) => z);

  // Obstáculos fijos: los controles sobre el mapa y los puntos de todas las zonas.
  const rects = (selector: string) =>
    contenedor ? Array.from(contenedor.querySelectorAll<HTMLElement>(selector), (el) => el.getBoundingClientRect()) : [];
  const controles = rects('.leaflet-control-zoom, [data-tapa-etiquetas]');
  const ocupados: DOMRect[] = [...controles, ...rects('.yaku-marcador-punto')];
  const limites = contenedor?.getBoundingClientRect();

  const seTocan = (r: DOMRect, o: DOMRect) =>
    r.left < o.right + 2 && r.right + 2 > o.left && r.top < o.bottom + 2 && r.bottom + 2 > o.top;
  // Una etiqueta que se sale del mapa no se lee: cuenta como choque.
  const dentro = (r: DOMRect) =>
    !limites || (r.left >= limites.left + 4 && r.right <= limites.right - 4 && r.top >= limites.top + 4 && r.bottom <= limites.bottom - 4);
  const choca = (r: DOMRect) => !dentro(r) || ocupados.some((o) => seTocan(r, o));
  const chocaConControles = (r: DOMRect) => !dentro(r) || controles.some((o) => seTocan(r, o));

  for (const zona of ordenadas) {
    const etiqueta = marcadores.get(zona.zonaId)?.getElement()?.querySelector<HTMLElement>('.yaku-marcador-etiqueta');
    if (!etiqueta) continue;
    etiqueta.classList.remove('yaku-marcador-etiqueta--oculta');

    // Probar cada lugar alrededor del punto y quedarse con el primero libre.
    let elegido: { posicion: Posicion; rect: DOMRect } | null = null;
    for (const posicion of POSICIONES) {
      ponerPosicion(etiqueta, posicion);
      const rect = etiqueta.getBoundingClientRect();
      if (rect.width === 0 || !choca(rect)) {
        elegido = { posicion, rect };
        break;
      }
    }

    if (elegido) {
      ponerPosicion(etiqueta, elegido.posicion);
      ocupados.push(elegido.rect);
    } else if (zona.zonaId === seleccionadaId) {
      // La seleccionada se ve siempre (su marcador va por encima de los vecinos):
      // se acepta pisar puntos vecinos, pero no salirse del mapa ni quedar bajo los controles.
      const posicion =
        POSICIONES.find((p) => {
          ponerPosicion(etiqueta, p);
          return !chocaConControles(etiqueta.getBoundingClientRect());
        }) ?? 'abajo';
      ponerPosicion(etiqueta, posicion);
      ocupados.push(etiqueta.getBoundingClientRect());
    } else {
      ponerPosicion(etiqueta, 'abajo');
      etiqueta.classList.add('yaku-marcador-etiqueta--oculta');
    }
  }
}

type Posicion = 'abajo' | 'derecha' | 'izquierda' | 'arriba';
const POSICIONES: Posicion[] = ['abajo', 'derecha', 'izquierda', 'arriba'];

function ponerPosicion(etiqueta: HTMLElement, posicion: Posicion) {
  for (const p of POSICIONES) etiqueta.classList.toggle(`yaku-marcador-etiqueta--${p}`, p === posicion && p !== 'abajo');
}

// La fecha GIBS viene YYYY-MM-DD; se muestra como dd/mm/aaaa.
const fechaGibs = (iso: string) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

export default function MapaZonas({ zonas, seleccionadaId, onSeleccionar }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [capaSatelital, setCapaSatelital] = useState<CapaGibs | null>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadoresRef = useRef(new Map<string, L.Marker>());
  const encuadreRef = useRef<string | null>(null);
  // El click del marcador usa la última versión del callback sin recrear el mapa.
  const onSeleccionarRef = useRef(onSeleccionar);
  onSeleccionarRef.current = onSeleccionar;
  // Últimos datos para re-acomodar etiquetas al cambiar el zoom.
  const datosRef = useRef({ zonas, seleccionadaId });
  datosRef.current = { zonas, seleccionadaId };

  // Crear el mapa una sola vez y limpiar al desmontar (StrictMode lo monta dos
  // veces en desarrollo).
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || mapaRef.current) return;

    const mapa = L.map(contenedor);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);
    mapaRef.current = mapa;
    mapa.on('zoomend moveend', () =>
      acomodarEtiquetas(
        contenedor.parentElement,
        marcadoresRef.current,
        datosRef.current.zonas,
        datosRef.current.seleccionadaId,
      ),
    );

    // El contenedor cambia de alto al pasar de celular a escritorio.
    const observer = new ResizeObserver(() => mapa.invalidateSize());
    observer.observe(contenedor);

    return () => {
      observer.disconnect();
      mapa.remove();
      mapaRef.current = null;
      marcadoresRef.current.clear();
      encuadreRef.current = null;
    };
  }, []);

  // Crear, borrar y encuadrar marcadores cuando cambian las zonas.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    const marcadores = marcadoresRef.current;
    const ids = new Set(zonas.map((z) => z.zonaId));
    for (const [id, m] of marcadores) {
      if (!ids.has(id)) {
        m.remove();
        marcadores.delete(id);
      }
    }

    for (const zona of zonas) {
      if (!marcadores.has(zona.zonaId)) {
        const marker = L.marker([zona.lat, zona.lon], { keyboard: true });
        const zonaId = zona.zonaId;
        marker.on('click', () => onSeleccionarRef.current(zonaId));
        marker.addTo(mapa);
        marcadores.set(zona.zonaId, marker);
      }
    }

    // Encuadre que abarca todas las zonas; solo si el encuadre cambió, para no
    // reiniciar el zoom en cada refresco de datos.
    if (zonas.length > 0) {
      const bounds = L.latLngBounds(zonas.map((z) => [z.lat, z.lon] as [number, number]));
      const clave = bounds.toBBoxString();
      if (encuadreRef.current !== clave) {
        encuadreRef.current = clave;
        // Más margen abajo: ahí están los botones de capa y las etiquetas cuelgan del punto.
        mapa.fitBounds(bounds, { paddingTopLeft: [32, 32], paddingBottomRight: [32, 56] });
      }
    }
  }, [zonas]);

  // Actualizar ícono, tooltip y aria-label al cambiar datos o selección.
  useEffect(() => {
    const marcadores = marcadoresRef.current;
    for (const zona of zonas) {
      const marker = marcadores.get(zona.zonaId);
      if (!marker) continue;
      const seleccionada = zona.zonaId === seleccionadaId;
      marker.setIcon(iconoZona(zona, seleccionada));
      // La seleccionada queda por encima de las vecinas.
      marker.setZIndexOffset(seleccionada ? 1000 : 0);
      const el = marker.getElement();
      if (el) {
        el.setAttribute('aria-label', etiquetaAccesible(zona));
        el.setAttribute('title', etiquetaAccesible(zona));
      }
    }
    acomodarEtiquetas(contenedorRef.current?.parentElement ?? null, marcadores, zonas, seleccionadaId);
  }, [zonas, seleccionadaId]);

  // Si la zona elegida (por ejemplo desde la lista) quedó fuera de la vista, llevar el mapa hasta ella.
  useEffect(() => {
    const mapa = mapaRef.current;
    const zona = zonas.find((z) => z.zonaId === seleccionadaId);
    if (!mapa || !zona) return;
    const punto = L.latLng(zona.lat, zona.lon);
    if (!mapa.getBounds().pad(-0.1).contains(punto)) mapa.panTo(punto);
    // Solo al cambiar la selección: un refresco de datos no debe mover el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionadaId]);

  // Capa satelital GIBS (datos reales de NASA): se apila sobre los tiles base y
  // se saca entera al cambiar o apagarla. Su atribución la muestra Leaflet abajo.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !capaSatelital) return;
    const capa = crearCapaGibs(capaSatelital);
    capa.addTo(mapa);
    return () => {
      capa.remove();
    };
  }, [capaSatelital]);

  return (
    <div className="relative h-full w-full">
      <div ref={contenedorRef} className="h-full w-full" aria-label="Mapa de zonas" />
      {/* z-[1000]: los paneles de Leaflet usan z-index 400-700 (controles 1000). */}
      <div data-tapa-etiquetas className="absolute bottom-2 left-2 z-[1000] flex flex-col items-start gap-1">
        <div role="group" aria-label="Capa satelital" className="flex gap-1">
          <button
            type="button"
            onClick={() => setCapaSatelital(null)}
            aria-pressed={capaSatelital === null}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-bold shadow-sm transition-colors ${
              capaSatelital === null ? 'border-rio-profundo bg-rio-profundo text-papel' : 'border-line bg-card text-fg'
            }`}
          >
            Ninguna
          </button>
          {(Object.keys(CAPAS_GIBS) as CapaGibs[]).map((clave) => (
            <button
              key={clave}
              type="button"
              onClick={() => setCapaSatelital(clave)}
              aria-pressed={capaSatelital === clave}
              className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-bold shadow-sm transition-colors ${
                capaSatelital === clave ? 'border-rio-profundo bg-rio-profundo text-papel' : 'border-line bg-card text-fg'
              }`}
            >
              {clave === 'precipitacion' ? 'Lluvia' : 'Vegetación'}
            </button>
          ))}
        </div>
        {capaSatelital && (
          <p className="rounded-full bg-card/95 px-3 py-1 text-xs text-muted shadow-sm">
            {CAPAS_GIBS[capaSatelital].nombre} · datos del {fechaGibs(CAPAS_GIBS[capaSatelital].fechaPorDefecto())} ·
            NASA GIBS
          </p>
        )}
      </div>
    </div>
  );
}
