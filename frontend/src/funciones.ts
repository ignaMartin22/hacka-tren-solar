// Flags de las pantallas que todavía dependen de datos de ejemplo o de
// endpoints propuestos (CONTEXT.md: en producción no se muestran pantallas
// con datos de ejemplo hasta que el backend exista).
// Por defecto: prendidas en desarrollo (import.meta.env.DEV), apagadas en
// producción. Se fuerzan con VITE_MOSTRAR_* (ver frontend/.env.example).
const flag = (valor: string | undefined): boolean =>
  valor === undefined ? import.meta.env.DEV : valor === 'true' || valor === '1';

export const MOSTRAR_REPLAY = flag(import.meta.env.VITE_MOSTRAR_REPLAY);
export const MOSTRAR_SUSCRIPCION = flag(import.meta.env.VITE_MOSTRAR_SUSCRIPCION);
export const MOSTRAR_INSTITUCIONAL = flag(import.meta.env.VITE_MOSTRAR_INSTITUCIONAL);
export const MOSTRAR_TENDENCIA = flag(import.meta.env.VITE_MOSTRAR_TENDENCIA);
