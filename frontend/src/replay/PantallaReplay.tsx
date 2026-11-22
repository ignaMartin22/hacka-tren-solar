// Pantalla del Modo Replay (CONTEXT.md, sección 7): reproduce día por día cómo
// subía el semáforo antes de un evento. Se prueba con /replay-demo.html.
// No usa Leaflet ni componentes de otras pantallas: el badge sale de src/niveles.ts.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NIVELES, type Nivel } from '../../../config/riesgo';
import { estiloNivel } from '../niveles';
import type { DiaReplay, EventoReplay, ZonaDiaReplay } from './tipos';

const INTERVALO_MS = 1200;

// La fecha viene como YYYY-MM-DD; el mediodía local evita que la zona horaria la corra un día.
const fechaDe = (iso: string) => new Date(`${iso}T12:00:00`);
const fechaLarga = (iso: string) =>
  fechaDe(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const esAlerta = (nivel: Nivel | null) => nivel === 'naranja' || nivel === 'rojo';

function peorNivelDelDia(dia: DiaReplay): Nivel | null {
  let peor: Nivel | null = null;
  for (const z of dia.zonas) {
    if (z.nivel !== null && (peor === null || NIVELES.indexOf(z.nivel) > NIVELES.indexOf(peor))) peor = z.nivel;
  }
  return peor;
}

function BadgeNivel({ nivel }: { nivel: Nivel | null }) {
  const estilo = estiloNivel(nivel);
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold tracking-[0.04em] ${estilo.clase}`}>
      {estilo.etiqueta}
    </span>
  );
}

function TarjetaZonaDia({ zona }: { zona: ZonaDiaReplay }) {
  return (
    <li className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{zona.nombre}</h3>
        <BadgeNivel nivel={zona.nivel} />
      </div>
      {zona.motivos[0] && <p className="mt-2 text-[15px] leading-normal">{zona.motivos[0].texto}</p>}
    </li>
  );
}

export default function PantallaReplay({ evento, deEjemplo }: { evento: EventoReplay; deEjemplo?: boolean }) {
  const dias = evento.dias;
  const indiceEvento = dias.findIndex((d) => d.fecha === evento.diaEvento);
  const ultimo = dias.length - 1;

  const [indice, setIndice] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);

  // Mientras el evento no esté verificado, el aviso de ejemplo se muestra igual.
  const esEjemplo = deEjemplo ?? !evento.verificado;
  const dia = dias[indice];

  const irA = useCallback(
    (i: number) => setIndice(Math.min(Math.max(i, 0), Math.max(ultimo, 0))),
    [ultimo],
  );

  const alternar = useCallback(() => {
    setReproduciendo((r) => {
      // Al final, "Reproducir" vuelve a empezar desde el primer día.
      if (!r && indice >= ultimo) setIndice(0);
      return !r;
    });
  }, [indice, ultimo]);

  // Reproducción: un día cada ~1,2 s y se detiene en el último.
  useEffect(() => {
    if (!reproduciendo) return;
    if (indice >= ultimo) {
      setReproduciendo(false);
      return;
    }
    const id = setTimeout(() => setIndice(indice + 1), INTERVALO_MS);
    return () => clearTimeout(id);
  }, [reproduciendo, indice, ultimo]);

  // Teclado: flechas cambian de día (y frenan la reproducción), espacio play/pausa.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setReproduciendo(false);
        irA(indice - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setReproduciendo(false);
        irA(indice + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        alternar();
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [indice, irA, alternar]);

  // "X días antes del evento, Y zonas ya estaban en NARANJA o ROJO", calculado de los datos.
  const resumen = useMemo(() => {
    const iFin = indiceEvento >= 0 ? indiceEvento : ultimo;
    const iAlerta = dias.findIndex((d) => d.zonas.some((z) => esAlerta(z.nivel)));
    if (iAlerta < 0) return 'En esta secuencia ninguna zona llegó a NARANJA ni a ROJO.';
    if (iAlerta >= iFin) return 'Las zonas llegaron a NARANJA o ROJO recién el día del evento.';
    const diasAntes = iFin - iAlerta;
    const zonasEnAlerta = dias[iAlerta]!.zonas.filter((z) => esAlerta(z.nivel)).length;
    return `${diasAntes} ${diasAntes === 1 ? 'día' : 'días'} antes del evento, ${zonasEnAlerta} ${
      zonasEnAlerta === 1 ? 'zona ya estaba' : 'zonas ya estaban'
    } en NARANJA o ROJO.`;
  }, [dias, indiceEvento, ultimo]);

  if (!dia) {
    return <p className="p-4 text-muted">Este evento todavía no tiene días cargados.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 md:px-6 md:py-8">
      <header>
        <h1 className="font-display text-lg font-bold text-terracota">Modo Replay</h1>
        <p className="mt-1 font-display text-2xl font-bold md:text-3xl">{evento.titulo}</p>
        <p className="mt-1 text-[15px] leading-normal text-muted">{evento.descripcion}</p>
        {evento.fuente && <p className="mt-1 text-sm text-muted">Fuente: {evento.fuente}</p>}
        {esEjemplo && (
          <p role="status" className="mt-3 rounded-xl border-l-4 border-muted bg-bg-2 p-3 text-[15px]">
            Datos de ejemplo: todavía no cargamos un evento real verificado.
          </p>
        )}
      </header>

      {/* Controles de reproducción */}
      <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Controles del replay">
        <button
          type="button"
          onClick={() => {
            setReproduciendo(false);
            irA(indice - 1);
          }}
          disabled={indice <= 0}
          className="flex min-h-11 items-center justify-center gap-1 rounded-full border border-line bg-card px-3 font-bold disabled:opacity-40"
        >
          <span aria-hidden="true" className="hidden sm:inline">
            ←
          </span>
          Anterior
        </button>
        <button
          type="button"
          onClick={alternar}
          aria-pressed={reproduciendo}
          className="flex min-h-11 items-center justify-center rounded-full bg-rio-profundo px-3 font-bold text-papel"
        >
          {reproduciendo ? 'Pausa' : 'Reproducir'}
        </button>
        <button
          type="button"
          onClick={() => {
            setReproduciendo(false);
            irA(indice + 1);
          }}
          disabled={indice >= ultimo}
          className="flex min-h-11 items-center justify-center gap-1 rounded-full border border-line bg-card px-3 font-bold disabled:opacity-40"
        >
          Siguiente
          <span aria-hidden="true" className="hidden sm:inline">
            →
          </span>
        </button>
      </div>

      {/* Línea de tiempo: un punto por día, con el color del peor nivel de ese día. */}
      <ol
        aria-label="Línea de tiempo: un día por punto"
        className="mt-4 flex items-start overflow-x-auto px-1 pb-1 sm:justify-center"
      >
        {dias.map((d, i) => {
          const peor = peorNivelDelDia(d);
          const estilo = estiloNivel(peor);
          const esEvento = i === indiceEvento;
          return (
            <li key={d.fecha} className="flex w-14 shrink-0 flex-col items-center">
              <button
                type="button"
                ref={i === indice ? (el) => el?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) : undefined}
                onClick={() => {
                  setReproduciendo(false);
                  irA(i);
                }}
                aria-label={`${fechaLarga(d.fecha)}: nivel más alto ${estilo.etiqueta}${esEvento ? ', día del evento' : ''}`}
                aria-current={i === indice ? 'date' : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-full motion-safe:transition-colors ${
                  i === indice ? 'bg-chip' : ''
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full ${esEvento ? 'ring-2 ring-fg ring-offset-2 ring-offset-bg' : ''} ${
                    i === indice ? 'scale-125 motion-safe:transition-transform' : 'motion-safe:transition-transform'
                  }`}
                  style={{ backgroundColor: estilo.fondo }}
                />
              </button>
              <span className="mt-1 min-h-8 text-center text-xs leading-tight font-bold">
                {esEvento ? 'Día del evento' : ''}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Contenido del día */}
      <section aria-label={`Día ${indice + 1} de ${dias.length}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 aria-live="polite" className="font-display text-2xl font-bold md:text-3xl">
            {fechaLarga(dia.fecha)}
          </h2>
          {indice === indiceEvento && (
            <span className="rounded-full border border-line bg-chip px-3 py-1 text-xs font-bold tracking-[0.04em] uppercase">
              Día del evento
            </span>
          )}
          <span className="text-sm text-muted">
            día {indice + 1} de {dias.length}
          </span>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {dia.zonas.map((z) => (
            <TarjetaZonaDia key={z.zonaId} zona={z} />
          ))}
        </ul>
      </section>

      <aside className="mt-6 rounded-card border border-line bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-bold text-terracota">Resumen</h2>
        <p className="mt-1 text-[15px] leading-normal">{resumen}</p>
      </aside>
    </div>
  );
}
