import { useEffect, useState } from 'react';
import { obtenerEstado, type EstadoZona, type RespuestaEstado } from './api';
import { estiloNivel } from './niveles';

const fechaHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'sin datos';

function BadgeNivel({ zona }: { zona: EstadoZona }) {
  const estilo = estiloNivel(zona.nivel);
  return (
    <span className={`rounded-full px-3 py-1 text-[13px] font-bold tracking-[0.04em] ${estilo.clase}`}>
      {estilo.etiqueta}
    </span>
  );
}

function TarjetaZona({ zona }: { zona: EstadoZona }) {
  return (
    <li className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
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
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-papel px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <img src="/brand/yaku-horizontal.svg" alt="Yaku" className="h-8 w-auto" width={105} height={32} />
          <p className="text-sm text-muted">Alertas satelitales para el agua del norte jujeño</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 md:p-6">
        {error && (
          <p className="rounded-xl border-l-4 border-muted bg-bg-2 p-3">
            No se pudo cargar el estado de las zonas: {error}
          </p>
        )}
        {!estado && !error && <p className="text-muted">Cargando…</p>}
        {estado && (
          <>
            <p className="mb-3 text-sm text-muted">Última actualización de datos: {fechaHora(estado.datosDe)}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {estado.zonas.map((z) => (
                <TarjetaZona key={z.zonaId} zona={z} />
              ))}
            </ul>
          </>
        )}
      </main>
      <footer className="bg-bg-2 px-4 py-5 text-sm text-muted md:px-6">
        <p className="mx-auto max-w-3xl">
          Yaku da una alerta de riesgo, no una predicción ni una detección confirmada. Datos satelitales y de modelos
          meteorológicos de{' '}
          <a className="text-rio-profundo underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
          . Umbrales iniciales, sin validar.
        </p>
      </footer>
    </div>
  );
}
