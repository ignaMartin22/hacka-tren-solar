import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { EstadoZona } from '../api';
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

export default function MapaZonas({ zonas, seleccionadaId, onSeleccionar }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadoresRef = useRef(new Map<string, L.Marker>());
  const encuadreRef = useRef<string | null>(null);
  // El click del marcador usa la última versión del callback sin recrear el mapa.
  const onSeleccionarRef = useRef(onSeleccionar);
  onSeleccionarRef.current = onSeleccionar;

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
    // INTEGRAR: selector de capa satelital — capa alternativa sobre estos tiles
    mapaRef.current = mapa;

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
        mapa.fitBounds(bounds, { padding: [32, 32] });
      }
    }
  }, [zonas]);

  // Actualizar ícono, tooltip y aria-label al cambiar datos o selección.
  useEffect(() => {
    const marcadores = marcadoresRef.current;
    for (const zona of zonas) {
      const marker = marcadores.get(zona.zonaId);
      if (!marker) continue;
      marker.setIcon(iconoZona(zona, zona.zonaId === seleccionadaId));
      const el = marker.getElement();
      if (el) {
        el.setAttribute('aria-label', etiquetaAccesible(zona));
        el.setAttribute('title', etiquetaAccesible(zona));
      }
    }
  }, [zonas, seleccionadaId]);

  return <div ref={contenedorRef} className="h-full w-full" aria-label="Mapa de zonas" />;
}
