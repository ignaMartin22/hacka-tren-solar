import { useEffect, useState } from 'react';
import type { Zona } from '../../../config/zonas';
import Encabezado from '../componentes/Encabezado';
import Pie from '../componentes/Pie';

// Lee la URL base del bot de Telegram (por ejemplo https://t.me/YakuBot).
// Devuelve null cuando todavía no está configurada: sin bot no hay suscripción.
export function enlaceBotDesdeEntorno(): string | null {
  const url = import.meta.env.VITE_TELEGRAM_BOT_URL;
  return typeof url === 'string' && url.trim() !== '' ? url : null;
}

const BASE = import.meta.env.VITE_API_URL ?? '';

async function obtenerZonas(): Promise<Zona[]> {
  const res = await fetch(`${BASE}/api/zonas`);
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  return res.json();
}

export default function PantallaSuscripcion({ enlaceBot }: { enlaceBot: string | null }) {
  const [zonas, setZonas] = useState<Zona[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elegida, setElegida] = useState<string | null>(null);

  useEffect(() => {
    obtenerZonas()
      .then((lista) => {
        setZonas(lista);
        setElegida(lista[0]?.id ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <Encabezado />

      <main className="flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-2xl font-bold text-terracota">Recibí avisos en tu celular</h1>
          <p className="mt-2 text-base leading-normal">
            Los avisos llegan por Telegram. El NARANJA se envía automático; el ROJO solo cuando lo confirma una
            persona responsable.
          </p>

          <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend className="font-display text-lg font-bold text-terracota">Elegí tu zona</legend>
              {error && (
                <p className="mt-3 rounded-xl border-l-4 border-muted bg-bg-2 p-3">
                  No se pudo cargar la lista de zonas: {error}
                </p>
              )}
              {!zonas && !error && <p className="mt-3 text-muted">Cargando…</p>}
              {zonas && (
                <div className="mt-3 grid gap-2">
                  {zonas.map((zona) => (
                    <label
                      key={zona.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                        elegida === zona.id ? 'border-rio-profundo bg-chip' : 'border-line bg-card'
                      }`}
                    >
                      <input
                        type="radio"
                        name="zona"
                        value={zona.id}
                        checked={elegida === zona.id}
                        onChange={() => setElegida(zona.id)}
                        className="size-5 accent-rio-profundo"
                      />
                      <span className="min-w-0">
                        <span className="block font-bold">{zona.nombre}</span>
                        <span className="block text-sm text-muted">
                          {zona.region} · {zona.amenaza === 'aludes' ? 'Aludes' : 'Sequía'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {enlaceBot ? (
              <a
                href={elegida ? `${enlaceBot}?start=${elegida}` : undefined}
                aria-disabled={!elegida}
                className={`mt-6 flex min-h-11 items-center justify-center rounded-full px-6 font-bold ${
                  elegida
                    ? 'bg-rio-profundo text-papel'
                    : 'pointer-events-none bg-chip text-muted'
                }`}
              >
                Abrir en Telegram
              </a>
            ) : (
              <p className="mt-6 rounded-xl border border-line bg-bg-2 p-3 text-center">
                La suscripción por Telegram todavía no está disponible.
              </p>
            )}
          </form>
        </div>
      </main>

      <Pie />
    </div>
  );
}
