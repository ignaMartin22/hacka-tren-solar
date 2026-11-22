import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { EstadoZona } from '../api';
import { obtenerEstado } from '../api';
import BadgeNivel from '../componentes/BadgeNivel';
import {
  INSTITUCIONAL_DISPONIBLE,
  borrarToken,
  confirmarAviso,
  entrar,
  guardarToken,
  leerToken,
  obtenerAvisos,
  type Aviso,
} from './api';

const fechaHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'sin datos';

const numero = (n: number | null, decimales = 1) => (n === null ? '—' : n.toFixed(decimales));

function Login({ onEntrar }: { onEntrar: (token: string) => void }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const { token } = await entrar(clave);
      guardarToken(token);
      onEntrar(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="font-display text-2xl font-bold text-terracota">Vista institucional</h1>
      <p className="mt-2 text-base">Para municipios, Defensa Civil y Vialidad.</p>
      {!INSTITUCIONAL_DISPONIBLE && (
        <p className="mt-4 rounded-xl border border-line bg-bg-2 p-3 font-bold">
          Modo de ejemplo: sin seguridad real
        </p>
      )}
      <form onSubmit={enviar} className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-bold">Clave</span>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            className="min-h-11 rounded-xl border border-line bg-card px-4"
          />
        </label>
        {error && <p className="rounded-xl border-l-4 border-muted bg-bg-2 p-3">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="min-h-11 rounded-full bg-rio-profundo px-6 font-bold text-papel disabled:opacity-60"
        >
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

function TablaTecnica({ zonas }: { zonas: EstadoZona[] }) {
  return (
    <>
      {/* Celular: tarjetas apiladas. */}
      <ul className="grid gap-3 md:hidden">
        {zonas.map((zona) => (
          <li key={zona.zonaId} className="rounded-card border border-line bg-card p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold">{zona.nombre}</h3>
              <BadgeNivel nivel={zona.nivel} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Lluvia 24 h</dt>
              <dd className="text-right font-mono">{numero(zona.variables?.lluvia24hMm ?? null)} mm</dd>
              <dt className="text-muted">Lluvia 72 h</dt>
              <dd className="text-right font-mono">{numero(zona.variables?.lluvia72hMm ?? null)} mm</dd>
              <dt className="text-muted">Pronóstico 24 h</dt>
              <dd className="text-right font-mono">{numero(zona.variables?.pronostico24hMm ?? null)} mm</dd>
              <dt className="text-muted">Suelo</dt>
              <dd className="text-right font-mono">{numero(zona.variables?.suelo ?? null, 2)} m³/m³</dd>
              <dt className="text-muted">Pendiente</dt>
              <dd className="text-right">{zona.variables?.pendiente ?? '—'}</dd>
            </dl>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla completa. */}
      <div className="hidden overflow-x-auto rounded-card border border-line bg-card shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg-2">
            <tr>
              <th className="px-4 py-3">Zona</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3 text-right">Lluvia 24 h (mm)</th>
              <th className="px-4 py-3 text-right">Lluvia 72 h (mm)</th>
              <th className="px-4 py-3 text-right">Pronóstico 24 h (mm)</th>
              <th className="px-4 py-3 text-right">Suelo (m³/m³)</th>
              <th className="px-4 py-3">Pendiente</th>
            </tr>
          </thead>
          <tbody>
            {zonas.map((zona) => (
              <tr key={zona.zonaId} className="border-b border-line last:border-0">
                <th scope="row" className="px-4 py-3 font-bold">
                  {zona.nombre}
                </th>
                <td className="px-4 py-3">
                  <BadgeNivel nivel={zona.nivel} />
                </td>
                <td className="px-4 py-3 text-right font-mono">{numero(zona.variables?.lluvia24hMm ?? null)}</td>
                <td className="px-4 py-3 text-right font-mono">{numero(zona.variables?.lluvia72hMm ?? null)}</td>
                <td className="px-4 py-3 text-right font-mono">{numero(zona.variables?.pronostico24hMm ?? null)}</td>
                <td className="px-4 py-3 text-right font-mono">{numero(zona.variables?.suelo ?? null, 2)}</td>
                <td className="px-4 py-3">{zona.variables?.pendiente ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ChipEstado({ estado }: { estado: Aviso['estado'] }) {
  const pendiente = estado === 'pendiente-confirmacion';
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[13px] font-bold ${
        pendiente ? 'border border-muted bg-bg-2' : 'bg-chip'
      }`}
    >
      {pendiente ? 'Pendiente de confirmación' : 'Enviado'}
    </span>
  );
}

export default function PantallaInstitucional() {
  const [token, setToken] = useState<string | null>(() => leerToken());
  const [zonas, setZonas] = useState<EstadoZona[] | null>(null);
  const [datosDe, setDatosDe] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<Aviso[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avisoAConfirmar, setAvisoAConfirmar] = useState<Aviso | null>(null);
  const [avisoConfirmado, setAvisoConfirmado] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([obtenerEstado(), obtenerAvisos()])
      .then(([estado, lista]) => {
        setZonas(estado.zonas);
        setDatosDe(estado.datosDe);
        setAvisos(lista);
      })
      .catch((e: Error) => setError(e.message));
  }, [token]);

  // showModal() atrapa el foco y Escape cierra solo; al cerrar el foco vuelve al botón.
  useEffect(() => {
    if (avisoAConfirmar && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [avisoAConfirmar]);

  const salir = () => {
    borrarToken();
    setToken(null);
  };

  const confirmar = async () => {
    if (!avisoAConfirmar) return;
    setConfirmando(true);
    try {
      if (INSTITUCIONAL_DISPONIBLE) {
        const actualizado = await confirmarAviso(avisoAConfirmar.id);
        setAvisos((lista) => lista?.map((a) => (a.id === actualizado.id ? actualizado : a)) ?? null);
        setAvisoConfirmado('Aviso confirmado y enviado.');
      } else {
        setAvisos(
          (lista) =>
            lista?.map((a) => (a.id === avisoAConfirmar.id ? { ...a, estado: 'enviado' as const } : a)) ?? null,
        );
        setAvisoConfirmado('Ejemplo: no se envió ningún mensaje.');
      }
      dialogRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar el aviso');
      dialogRef.current?.close();
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="px-4 py-6 md:px-6">
      {!token && <Login onEntrar={setToken} />}

        {token && (
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-terracota">Vista institucional</h1>
                <p className="mt-1 text-sm text-muted">Actualizado: {fechaHora(datosDe)}</p>
              </div>
              <button
                onClick={salir}
                className="min-h-11 rounded-full border border-line bg-card px-5 font-bold text-fg"
              >
                Salir
              </button>
            </div>

            {!INSTITUCIONAL_DISPONIBLE && (
              <p className="mt-4 rounded-xl border border-line bg-bg-2 p-3 font-bold">
                Modo de ejemplo: sin seguridad real
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-xl border-l-4 border-muted bg-bg-2 p-3">
                No se pudieron cargar los datos: {error}
              </p>
            )}

            <section aria-labelledby="titulo-tecnica" className="mt-6">
              <h2 id="titulo-tecnica" className="font-display text-lg font-bold text-terracota">
                Datos técnicos por zona
              </h2>
              {!zonas && !error && <p className="mt-3 text-muted">Cargando…</p>}
              {zonas && <div className="mt-3"><TablaTecnica zonas={zonas} /></div>}
            </section>

            <section aria-labelledby="titulo-avisos" className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="titulo-avisos" className="font-display text-lg font-bold text-terracota">
                  Historial de avisos
                </h2>
                {!INSTITUCIONAL_DISPONIBLE && (
                  <span className="rounded-full border border-line bg-bg-2 px-3 py-1 text-[13px] font-bold">
                    Datos de ejemplo
                  </span>
                )}
              </div>
              {avisoConfirmado && (
                <p className="mt-3 rounded-xl border-l-4 border-rio-profundo bg-bg-2 p-3">{avisoConfirmado}</p>
              )}
              {!avisos && !error && <p className="mt-3 text-muted">Cargando…</p>}
              {avisos && (
                <ul className="mt-3 grid gap-3">
                  {avisos.map((aviso) => (
                    <li key={aviso.id} className="rounded-card border border-line bg-card p-4 shadow-card">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold">
                            {aviso.zonaNombre} · {aviso.destinatarios} personas
                          </p>
                          <p className="text-sm text-muted">{fechaHora(aviso.creadoEn)}</p>
                        </div>
                        <BadgeNivel nivel={aviso.nivel} />
                        <ChipEstado estado={aviso.estado} />
                        {aviso.estado === 'pendiente-confirmacion' && (
                          <button
                            onClick={() => setAvisoAConfirmar(aviso)}
                            className="min-h-11 rounded-full bg-rio-profundo px-5 font-bold text-papel"
                          >
                            Confirmar y enviar
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      <dialog
        ref={dialogRef}
        onClose={() => setAvisoAConfirmar(null)}
        aria-labelledby="titulo-confirmar"
        className="fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-md rounded-card border border-line bg-card p-5 shadow-card backdrop:bg-noche/60"
      >
        {avisoAConfirmar && (
          <div>
            <h2 id="titulo-confirmar" className="font-display text-lg font-bold text-terracota">
              Confirmar aviso ROJO
            </h2>
            <p className="mt-2 text-sm text-muted">
              Este mensaje se envía a {avisoAConfirmar.destinatarios} personas suscriptas a{' '}
              {avisoAConfirmar.zonaNombre}.
            </p>
            <pre className="mt-3 rounded-xl border border-line bg-bg-2 p-3 font-sans text-sm whitespace-pre-wrap">
              {avisoAConfirmar.mensaje}
            </pre>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <form method="dialog">
                <button className="min-h-11 rounded-full border border-line bg-card px-5 font-bold">
                  Cancelar
                </button>
              </form>
              <button
                onClick={confirmar}
                disabled={confirmando}
                className="min-h-11 rounded-full bg-rio-profundo px-5 font-bold text-papel disabled:opacity-60"
              >
                {confirmando ? 'Enviando…' : 'Confirmar y enviar'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
