// DATOS DE EJEMPLO, NO REALES.
// Sirven solo para ver el gráfico mientras el backend no expone la tendencia.
// Quien los muestre debe marcarlos con el texto "Datos de ejemplo".
import type { Nivel } from '../../../config/riesgo';
import type { TendenciaZona } from '../tendencia/tipos';

const LLUVIA = [0, 2.4, 0.6, 11.8, 6.2, 1.1, 0];
const SUELO: (number | null)[] = [0.18, 0.21, 0.22, 0.31, 0.36, 0.33, null];
const NIVELES: (Nivel | null)[] = ['verde', 'verde', 'verde', 'amarillo', 'naranja', 'amarillo', null];

const dos = (n: number) => String(n).padStart(2, '0');

export function tendenciaDeEjemplo(zonaId: string): TendenciaZona {
  const hoy = new Date();
  const dias = LLUVIA.map((lluviaMm, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (6 - i));
    return {
      fecha: `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`,
      lluviaMm,
      sueloMedio: SUELO[i] ?? null,
      nivel: NIVELES[i] ?? null,
    };
  });
  return {
    zonaId,
    desde: `${dias[0]?.fecha}T03:00:00.000Z`,
    hasta: new Date().toISOString(),
    dias,
  };
}
