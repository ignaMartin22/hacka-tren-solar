import { useEffect, useState } from 'react';
import { obtenerEstado, type EstadoZona, type RespuestaEstado } from './api';
import Encabezado from './componentes/Encabezado';
import MapaZonas from './componentes/MapaZonas';
import Pie from './componentes/Pie';
import { estiloNivel } from './niveles';

const fechaHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'sin datos';

function BadgeNivel({ zona }: { zona: EstadoZona }) {
  const estilo = estiloNivel(zona.nivel);
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold tracking-[0.04em] ${estilo.clase}`}>
      {estilo.etiqueta}
    </span>
  );
}

function TarjetaZona({ zona }: { zona: EstadoZona }) {
  return (
    <li className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold">{zona.nombre}</h2>
          <p className="text-sm text-muted">
            {zona.region} · {zona.amenaza === 'aludes' ? 'Riesgo de aludes' : 'Sequía'}
          </p>
        </div>
        <BadgeNivel zona={zona} />
      </div>
      <ul className="mt-3 space-y-1 text-[15px] leading-normal">
        {zona.motivos.map((m) => (
          <li key={m.codigo}>{m.texto}</li>
        ))}
        {zona.aviso && <li className="text-muted">{zona.aviso}</li>}
      </ul>
    </li>
  );
}

export default function App() {
  const [estado, setEstado] = useState<RespuestaEstado | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerEstado()
      .then(setEstado)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    // Mobile first: todo en una columna con scroll de página.
    // Desde md: alto fijo de pantalla, mapa a la izquierda y panel con scroll propio a la derecha.
    <div className="flex min-h-dvh flex-col md:h-dvh md:min-h-0">
      <Encabezado />

      <main className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <section aria-label="Mapa de zonas" className="relative h-[45dvh] min-h-64 shrink-0 md:h-auto md:min-w-0 md:flex-1">
          <MapaZonas zonas={estado?.zonas ?? []} />
        </section>

        <aside
          aria-label="Estado de las zonas"
          className="flex flex-1 flex-col md:w-88 md:flex-none md:overflow-y-auto md:border-l md:border-line lg:w-104 xl:w-120"
        >
          <div className="flex-1 p-4 md:p-6">
            {error && (
              <p className="rounded-xl border-l-4 border-muted bg-bg-2 p-3">
                No se pudo cargar el estado de las zonas: {error}
              </p>
            )}
            {!estado && !error && <p className="text-muted">Cargando…</p>}
            {estado && (
              <>
                <p className="mb-3 text-sm text-muted">Actualizado: {fechaHora(estado.datosDe)}</p>
                <ul className="grid gap-3">
                  {estado.zonas.map((z) => (
                    <TarjetaZona key={z.zonaId} zona={z} />
                  ))}
                </ul>
              </>
            )}
          </div>
          <Pie />
        </aside>
      </main>
    </div>
  );
}
