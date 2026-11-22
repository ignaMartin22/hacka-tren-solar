import { useEffect, useState } from 'react';
import type { Nivel } from '../../config/riesgo';
import { obtenerEstado, type EstadoZona, type RespuestaEstado } from './api';

const ESTILO_NIVEL: Record<Nivel, { etiqueta: string; clase: string }> = {
  verde: { etiqueta: 'VERDE', clase: 'bg-green-600 text-white' },
  amarillo: { etiqueta: 'AMARILLO', clase: 'bg-yellow-400 text-black' },
  naranja: { etiqueta: 'NARANJA', clase: 'bg-orange-500 text-black' },
  rojo: { etiqueta: 'ROJO', clase: 'bg-red-600 text-white' },
};
const SIN_DATO = { etiqueta: 'SIN DATO', clase: 'bg-slate-300 text-slate-800' };

const fechaHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'sin datos';

function TarjetaZona({ zona }: { zona: EstadoZona }) {
  const estilo = zona.nivel ? ESTILO_NIVEL[zona.nivel] : SIN_DATO;
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{zona.nombre}</h2>
          <p className="text-sm text-slate-500">
            {zona.region} · {zona.amenaza === 'aludes' ? 'Riesgo de aludes' : 'Sequía'}
          </p>
        </div>
        <span className={`rounded px-3 py-1 text-sm font-bold ${estilo.clase}`}>{estilo.etiqueta}</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {zona.motivos.map((m) => (
          <li key={m.codigo}>{m.texto}</li>
        ))}
        {zona.aviso && <li className="text-slate-500">{zona.aviso}</li>}
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-sky-900 px-4 py-4 text-white">
        <h1 className="text-2xl font-bold">Yaku</h1>
        <p className="text-sm text-sky-100">Alertas satelitales para el agua del norte jujeño</p>
      </header>
      <main className="mx-auto max-w-3xl p-4">
        {error && <p className="rounded bg-red-100 p-3 text-red-800">No se pudo cargar el estado de las zonas: {error}</p>}
        {!estado && !error && <p className="text-slate-500">Cargando…</p>}
        {estado && (
          <>
            <p className="mb-3 text-sm text-slate-600">Última actualización de datos: {fechaHora(estado.datosDe)}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {estado.zonas.map((z) => (
                <TarjetaZona key={z.zonaId} zona={z} />
              ))}
            </ul>
          </>
        )}
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-6 text-xs text-slate-500">
        Yaku da una alerta de riesgo, no una predicción ni una detección confirmada. Datos satelitales y de modelos
        meteorológicos de{' '}
        <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
        . Umbrales iniciales, sin validar.
      </footer>
    </div>
  );
}
