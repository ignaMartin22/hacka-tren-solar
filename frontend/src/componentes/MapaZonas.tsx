import type { EstadoZona } from '../api';

// Lugar reservado para el mapa de Leaflet (tarea 4). Ocupa todo el contenedor que le da el layout.
export default function MapaZonas({ zonas }: { zonas: EstadoZona[] }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-chip text-muted">
      <img src="/brand/yaku-isotipo.svg" alt="" className="h-12 w-auto opacity-60" />
      <p className="text-sm">Mapa en preparación · {zonas.length} zonas</p>
    </div>
  );
}
