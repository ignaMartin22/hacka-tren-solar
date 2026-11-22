import type { Nivel } from '../../../config/riesgo';
import { estiloNivel } from '../niveles';

// Píldora con el color del nivel y su palabra (el color nunca va solo).
export default function BadgeNivel({ nivel }: { nivel: Nivel | null }) {
  const estilo = estiloNivel(nivel);
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold tracking-[0.04em] ${estilo.clase}`}>
      {estilo.etiqueta}
    </span>
  );
}
