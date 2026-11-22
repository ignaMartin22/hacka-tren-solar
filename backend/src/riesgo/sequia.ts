import { UMBRALES_SEQUIA, type Nivel } from '../../../config/riesgo';
import type { Motivo, VariablesSequia } from '../tipos';

const num = (n: number) => n.toFixed(0);
const diaMes = (fecha: string) => `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;

// Promedio histórico de lluvia para un conjunto de fechas, a partir del promedio de cada día del año (clave MM-DD).
export const promedioHistorico = (promedioDiarioMm: Record<string, number>, fechas: string[]): number =>
  fechas.reduce((total, fecha) => total + (promedioDiarioMm[fecha.slice(5)] ?? 0), 0);

// Aplica las reglas de sequía de CONTEXT.md (sección 6): lluvia de 90 días sobre el promedio histórico del mismo período.
export function evaluarSequia(lluvia90dMm: number, promedio90dMm: number, desde: string, hasta: string) {
  const u = UMBRALES_SEQUIA;
  const base = { desde, hasta, lluvia90dMm: Number(lluvia90dMm.toFixed(1)), promedio90dMm: Number(promedio90dMm.toFixed(1)) };
  const periodo = `entre el ${diaMes(desde)} y el ${diaMes(hasta)}`;
  if (promedio90dMm < u.promedioMinimoMm) {
    const variables: VariablesSequia = { ...base, cociente: null };
    const aviso = `Época seca, sin dato: ${periodo} lo habitual es que casi no llueva (${num(promedio90dMm)} mm de promedio), así que no se puede comparar.`;
    return { nivel: null, motivos: [] as Motivo[], aviso, variables };
  }
  const cociente = lluvia90dMm / promedio90dMm;
  const nivel: Nivel = cociente >= u.verdeDesde ? 'verde' : cociente >= u.amarilloDesde ? 'amarillo' : cociente >= u.naranjaDesde ? 'naranja' : 'rojo';
  const variables: VariablesSequia = { ...base, cociente: Number(cociente.toFixed(2)) };
  const motivo: Motivo = {
    codigo: 'lluvia_90d',
    texto: `En 90 días (${periodo}) llovieron ${num(lluvia90dMm)} mm. Lo habitual para esa época son ${num(promedio90dMm)} mm: llovió el ${num(cociente * 100)} % de lo normal.`,
  };
  return { nivel, motivos: [motivo], aviso: null, variables };
}
