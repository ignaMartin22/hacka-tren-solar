import type { EstadoZona } from '../api';
import BadgeNivel from './BadgeNivel';

interface Props {
  zonas: EstadoZona[];
  seleccionadaId: string | null;
  onSeleccionar: (zonaId: string) => void;
}

// Lista para elegir zona sin apuntar al marcador del mapa.
// Fila seleccionada: fondo chip + barra izquierda rio-profundo (DESIGN.md sección 7).
export default function ListaZonas({ zonas, seleccionadaId, onSeleccionar }: Props) {
  return (
    <nav aria-label="Zonas">
      <ul className="grid gap-1">
        {zonas.map((z) => {
          const seleccionada = z.zonaId === seleccionadaId;
          return (
            <li key={z.zonaId}>
              <button
                type="button"
                onClick={() => onSeleccionar(z.zonaId)}
                aria-pressed={seleccionada}
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border-l-[3px] px-4 py-2 text-left transition-colors ${
                  seleccionada ? 'border-rio-profundo bg-chip' : 'border-transparent hover:bg-chip/60'
                }`}
              >
                <span className="font-display font-bold">{z.nombre}</span>
                <BadgeNivel nivel={z.nivel} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
