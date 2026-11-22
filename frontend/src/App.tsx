import { useEffect, useRef, useState } from 'react';
import type { Nivel } from '../../config/riesgo';
import BannerDatosViejos from './componentes/BannerDatosViejos';
import Encabezado from './componentes/Encabezado';
import FichaZona, { fechaHoraCorta } from './componentes/FichaZona';
import ListaZonas from './componentes/ListaZonas';
import MapaZonas from './componentes/MapaZonas';
import Pie from './componentes/Pie';
import { useEstado } from './hooks/useEstado';

// Para la selección inicial: la zona de mayor riesgo primero.
const ORDEN_RIESGO: Record<Nivel, number> = { verde: 0, amarillo: 1, naranja: 2, rojo: 3 };

export default function App() {
  const { estado, error, cargando, actualizando, recargar } = useEstado();
  const [zonaSeleccionadaId, setZonaSeleccionadaId] = useState<string | null>(null);
  const fichaRef = useRef<HTMLDivElement>(null);

  // Zona por defecto: la de mayor riesgo (empate: la primera); si ninguna
  // tiene nivel, la primera de la lista.
  useEffect(() => {
    if (!estado || zonaSeleccionadaId) return;
    const conNivel = estado.zonas.filter((z) => z.nivel !== null);
    const porDefecto = conNivel.length
      ? conNivel.reduce((a, b) => (ORDEN_RIESGO[b.nivel!] > ORDEN_RIESGO[a.nivel!] ? b : a))
      : estado.zonas[0];
    if (porDefecto) setZonaSeleccionadaId(porDefecto.zonaId);
  }, [estado, zonaSeleccionadaId]);

  const zonaSeleccionada = estado?.zonas.find((z) => z.zonaId === zonaSeleccionadaId) ?? null;

  // En celular, elegir en el mapa lleva la vista a la ficha.
  const seleccionarDesdeMapa = (zonaId: string) => {
    setZonaSeleccionadaId(zonaId);
    if (window.matchMedia('(max-width: 767.98px)').matches) {
      requestAnimationFrame(() => fichaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  return (
    // Mobile first: todo en una columna con scroll de página.
    // Desde md: alto fijo de pantalla, mapa a la izquierda y panel con scroll propio a la derecha.
    <div className="flex min-h-dvh flex-col md:h-dvh md:min-h-0">
      <Encabezado />

      <main className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <section aria-label="Mapa de zonas" className="relative z-0 isolate h-[45dvh] min-h-64 shrink-0 md:h-auto md:min-w-0 md:flex-1">
          <MapaZonas zonas={estado?.zonas ?? []} seleccionadaId={zonaSeleccionadaId} onSeleccionar={seleccionarDesdeMapa} />
          {cargando && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-chip">
              {/* INTEGRAR: EsqueletoMapa — reemplazar este placeholder */}
              <img src="/brand/yaku-isotipo.svg" alt="" className="h-12 w-auto opacity-60" />
            </div>
          )}
        </section>

        <aside
          aria-label="Estado de las zonas"
          className="flex flex-1 flex-col md:w-88 md:flex-none md:overflow-y-auto md:border-l md:border-line lg:w-104 xl:w-120"
        >
          <div className="flex-1 space-y-4 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Actualizado: {fechaHoraCorta(estado?.datosDe ?? null)}</p>
              <button
                type="button"
                onClick={recargar}
                disabled={actualizando}
                className="min-h-11 shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm font-bold text-rio-profundo transition-colors hover:bg-chip disabled:opacity-60"
              >
                {actualizando ? 'Actualizando…' : 'Actualizar'}
              </button>
            </div>

            {estado && (estado.errorUltimaActualizacion !== null || error !== null) && <BannerDatosViejos />}

            {!estado && error && (
              <div className="rounded-card border border-line bg-card p-4 shadow-card">
                <p className="text-sm">No pudimos cargar el estado de las zonas.</p>
                <button
                  type="button"
                  onClick={recargar}
                  disabled={actualizando}
                  className="mt-3 min-h-11 rounded-full border border-line bg-card px-4 py-2 text-sm font-bold text-rio-profundo transition-colors hover:bg-chip disabled:opacity-60"
                >
                  {actualizando ? 'Actualizando…' : 'Reintentar'}
                </button>
              </div>
            )}

            {!estado && !error && (
              <div aria-busy="true">
                {/* INTEGRAR: EsqueletoPanel — reemplazar este placeholder */}
                <p className="text-sm text-muted">Cargando…</p>
              </div>
            )}

            {zonaSeleccionada && (
              <div ref={fichaRef} className="scroll-mt-4">
                <FichaZona zona={zonaSeleccionada} />
              </div>
            )}

            {estado && (
              <ListaZonas zonas={estado.zonas} seleccionadaId={zonaSeleccionadaId} onSeleccionar={setZonaSeleccionadaId} />
            )}

            {/* INTEGRAR: Leyenda — debajo de la lista de zonas */}
          </div>
          <Pie />
        </aside>
      </main>
    </div>
  );
}
