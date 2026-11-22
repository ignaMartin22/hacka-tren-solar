import { MOSTRAR_INSTITUCIONAL, MOSTRAR_REPLAY, MOSTRAR_SUSCRIPCION } from '../funciones';

export interface Enlace {
  ruta: string;
  texto: string;
}

// Menú de secciones: la pantalla principal siempre, las demás según los flags.
export const ENLACES: Enlace[] = [
  { ruta: '/', texto: 'Mapa' },
  ...(MOSTRAR_REPLAY ? [{ ruta: '/replay', texto: 'Replay' }] : []),
  ...(MOSTRAR_SUSCRIPCION ? [{ ruta: '/suscribirse', texto: 'Avisos' }] : []),
  ...(MOSTRAR_INSTITUCIONAL ? [{ ruta: '/institucional', texto: 'Institucional' }] : []),
];

export default function Encabezado({ rutaActual = '/' }: { rutaActual?: string }) {
  return (
    <header className="shrink-0 border-b border-line bg-papel px-4 py-2.5 md:px-6 md:py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
        <a href="#/" className="min-w-30">
          <img src="/brand/yaku-horizontal.svg" alt="Yaku" className="h-7 w-auto md:h-8" width={92} height={28} />
        </a>
        <p className="text-xs text-muted sm:text-sm">Alertas satelitales para el agua del norte jujeño</p>
      </div>
      {ENLACES.length > 1 && (
        <nav
          aria-label="Secciones"
          className="mt-1.5 flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:mt-2 [&::-webkit-scrollbar]:hidden"
        >
          {ENLACES.map((enlace) => {
            const activa = enlace.ruta === rutaActual;
            return (
              <a
                key={enlace.ruta}
                href={`#${enlace.ruta}`}
                aria-current={activa ? 'page' : undefined}
                className={`flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-bold transition-colors ${
                  activa ? 'bg-chip text-rio-profundo' : 'text-fg hover:bg-chip/60'
                }`}
              >
                {enlace.texto}
              </a>
            );
          })}
        </nav>
      )}
    </header>
  );
}
