// Jujuy usa UTC-3 todo el año (sin horario de verano).
const DESFASE_SEGUNDOS = -3 * 3600;

// Fecha local de Jujuy (AAAA-MM-DD) para un instante en segundos Unix.
export const fechaLocal = (segundosUnix: number): string => new Date((segundosUnix + DESFASE_SEGUNDOS) * 1000).toISOString().slice(0, 10);

// Instante (segundos Unix) de una fecha y hora local de Jujuy.
export const instanteLocal = (fecha: string, hora = 0): number => Date.parse(`${fecha}T00:00:00Z`) / 1000 - DESFASE_SEGUNDOS + hora * 3600;
