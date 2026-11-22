import { UMBRALES_ALUDES, type Nivel } from '../../../config/riesgo';
import type { Pendiente } from '../../../config/zonas';
import type { Motivo, ResultadoRiesgo, SerieHoraria, VariablesAludes } from '../tipos';

const HORA = 3600;

const num = (n: number, decimales = 0) => n.toFixed(decimales).replace('.', ',');
const redondear = (n: number, decimales: number) => Number(n.toFixed(decimales));

function sumar(valores: (number | null)[], desde: number, hasta: number): number {
  let total = 0;
  for (let i = Math.max(desde, 0); i <= Math.min(hasta, valores.length - 1); i++) total += valores[i] ?? 0;
  return total;
}

// Calcula las variables del motor a partir de la serie horaria, parado en el instante `ahora`.
// Lo anterior a `ahora` se toma como observado y lo posterior como pronóstico.
export function calcularVariables(serie: SerieHoraria, ahora: Date, pendiente: Pendiente): VariablesAludes {
  const t = Math.floor(ahora.getTime() / 1000);
  // Cada valor de lluvia corresponde a la hora previa a su marca de tiempo.
  const iAhora = serie.tiempos.findLastIndex((x) => x <= t);
  if (iAhora < 0 || t - serie.tiempos[iAhora]! >= HORA) throw new Error('La serie no cubre el momento pedido');
  if (serie.tiempos.length - 1 - iAhora < 24) throw new Error('La serie no tiene 24 horas de pronóstico');

  let lluvia24hMm = 0;
  for (let fin = iAhora; fin <= iAhora + 24; fin++) lluvia24hMm = Math.max(lluvia24hMm, sumar(serie.lluviaMm, fin - 23, fin));

  let suelo: number | null = null;
  for (let i = iAhora; i >= 0 && i > iAhora - 24 && suelo === null; i--) suelo = serie.suelo[i] ?? null;

  return {
    lluvia24hMm: redondear(lluvia24hMm, 1),
    lluvia72hMm: redondear(sumar(serie.lluviaMm, iAhora - 71, iAhora), 1),
    pronostico24hMm: redondear(sumar(serie.lluviaMm, iAhora + 1, iAhora + 24), 1),
    suelo: suelo === null ? null : redondear(suelo, 3),
    pendiente,
  };
}

// Aplica las reglas de CONTEXT.md (sección 6) y devuelve el nivel con los motivos que lo activaron.
export function evaluarAludes(v: VariablesAludes): ResultadoRiesgo {
  const u = UMBRALES_ALUDES;
  const suelo = v.suelo ?? 0;
  const resultado = (nivel: Nivel, motivos: Motivo[]): ResultadoRiesgo => ({ nivel, motivos, variables: v });

  const motivoLluvia24h = (umbral: number): Motivo => ({
    codigo: 'lluvia_24h',
    texto: `Hasta ${num(v.lluvia24hMm)} mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: ${umbral} mm).`,
  });
  const motivoSuelo = (umbral: number, saturado: boolean): Motivo => ({
    codigo: 'suelo',
    texto: `${saturado ? 'El suelo ya está saturado' : 'El suelo está muy húmedo'}: ${num(suelo, 2)} m³ de agua por m³ de suelo (umbral: ${num(umbral, 2)}).`,
  });

  const motivosRojo: Motivo[] = [];
  if (v.lluvia24hMm >= u.rojo.lluvia24hMm && suelo >= u.rojo.suelo) motivosRojo.push(motivoLluvia24h(u.rojo.lluvia24hMm), motivoSuelo(u.rojo.suelo, true));
  if (v.lluvia72hMm >= u.rojo.lluvia72hMm)
    motivosRojo.push({ codigo: 'lluvia_72h', texto: `Llovieron ${num(v.lluvia72hMm)} mm en los últimos 3 días (umbral: ${u.rojo.lluvia72hMm} mm).` });
  if (motivosRojo.length > 0) return resultado('rojo', motivosRojo);

  if (v.lluvia24hMm >= u.naranja.lluvia24hMm && suelo >= u.naranja.suelo && (u.naranja.pendientes as readonly string[]).includes(v.pendiente))
    return resultado('naranja', [
      motivoLluvia24h(u.naranja.lluvia24hMm),
      motivoSuelo(u.naranja.suelo, false),
      { codigo: 'pendiente', texto: `La pendiente de la cuenca es ${v.pendiente}.` },
    ]);

  const motivosAmarillo: Motivo[] = [];
  if (v.lluvia24hMm >= u.amarillo.lluvia24hMm) motivosAmarillo.push(motivoLluvia24h(u.amarillo.lluvia24hMm));
  if (suelo >= u.amarillo.suelo && v.pronostico24hMm >= u.amarillo.pronostico24hMm)
    motivosAmarillo.push(motivoSuelo(u.amarillo.suelo, false), {
      codigo: 'pronostico_24h',
      texto: `Se esperan ${num(v.pronostico24hMm)} mm de lluvia en las próximas 24 horas (umbral: ${u.amarillo.pronostico24hMm} mm).`,
    });
  if (motivosAmarillo.length > 0) return resultado('amarillo', motivosAmarillo);

  return resultado('verde', [
    {
      codigo: 'sin_alerta',
      texto:
        v.suelo === null
          ? `Sin lluvias fuertes: hasta ${num(v.lluvia24hMm)} mm en 24 horas. No hay dato de humedad del suelo.`
          : `Sin lluvias fuertes ni suelo saturado: hasta ${num(v.lluvia24hMm)} mm en 24 horas y humedad del suelo de ${num(suelo, 2)}.`,
    },
  ]);
}

export function calcularAludes(serie: SerieHoraria, ahora: Date, pendiente: Pendiente): ResultadoRiesgo {
  return evaluarAludes(calcularVariables(serie, ahora, pendiente));
}
