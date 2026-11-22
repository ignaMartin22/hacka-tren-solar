import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SerieHoraria, VariablesAludes } from '../tipos';
import { calcularVariables, evaluarAludes } from './aludes';

const base: VariablesAludes = { lluvia24hMm: 0, lluvia72hMm: 0, pronostico24hMm: 0, suelo: 0.2, pendiente: 'alta' };
const nivel = (v: Partial<VariablesAludes>) => evaluarAludes({ ...base, ...v }).nivel;
const codigos = (v: Partial<VariablesAludes>) => evaluarAludes({ ...base, ...v }).motivos.map((m) => m.codigo);

test('verde cuando no se cumple ninguna regla', () => {
  assert.equal(nivel({}), 'verde');
  assert.equal(nivel({ lluvia24hMm: 14.9, suelo: 0.29, pronostico24hMm: 30 }), 'verde');
  assert.deepEqual(codigos({}), ['sin_alerta']);
});

test('amarillo por lluvia o por suelo húmedo con pronóstico', () => {
  assert.equal(nivel({ lluvia24hMm: 15 }), 'amarillo');
  assert.equal(nivel({ suelo: 0.3, pronostico24hMm: 5 }), 'amarillo');
  assert.equal(nivel({ suelo: 0.3, pronostico24hMm: 4.9 }), 'verde');
  assert.deepEqual(codigos({ suelo: 0.31, pronostico24hMm: 8 }), ['suelo', 'pronostico_24h']);
});

test('naranja exige lluvia, suelo húmedo y pendiente media o alta', () => {
  assert.equal(nivel({ lluvia24hMm: 25, suelo: 0.3, pendiente: 'media' }), 'naranja');
  assert.equal(nivel({ lluvia24hMm: 25, suelo: 0.3, pendiente: 'baja' }), 'amarillo');
  assert.equal(nivel({ lluvia24hMm: 25, suelo: 0.29 }), 'amarillo');
  assert.deepEqual(codigos({ lluvia24hMm: 30, suelo: 0.32 }), ['lluvia_24h', 'suelo', 'pendiente']);
});

test('rojo por lluvia con suelo saturado o por acumulado de 72 horas', () => {
  assert.equal(nivel({ lluvia24hMm: 45, suelo: 0.35 }), 'rojo');
  assert.equal(nivel({ lluvia24hMm: 45, suelo: 0.34 }), 'naranja');
  assert.equal(nivel({ lluvia72hMm: 90, pendiente: 'baja' }), 'rojo');
  assert.deepEqual(codigos({ lluvia24hMm: 48, suelo: 0.37, lluvia72hMm: 95 }), ['lluvia_24h', 'suelo', 'lluvia_72h']);
});

test('los motivos explican el porqué con los valores', () => {
  const [lluvia, suelo] = evaluarAludes({ ...base, lluvia24hMm: 48, suelo: 0.37 }).motivos;
  assert.match(lluvia!.texto, /48 mm de lluvia en 24 horas/);
  assert.match(suelo!.texto, /saturado: 0,37/);
});

test('sin dato de suelo no se activan las reglas que lo necesitan', () => {
  assert.equal(nivel({ lluvia24hMm: 60, suelo: null }), 'amarillo');
  assert.equal(nivel({ suelo: null, pronostico24hMm: 20 }), 'verde');
});

// Serie de 120 horas: 96 observadas (hasta `ahora`) y 24 de pronóstico.
function serie(lluvia: Record<number, number>, suelo = 0.25): { serie: SerieHoraria; ahora: Date } {
  const t0 = 1_800_000_000 - (1_800_000_000 % 3600);
  const tiempos = Array.from({ length: 120 }, (_, i) => t0 + i * 3600);
  return {
    serie: { tiempos, lluviaMm: tiempos.map((_, i) => lluvia[i] ?? 0), suelo: tiempos.map(() => suelo) },
    ahora: new Date((tiempos[95]! + 600) * 1000),
  };
}

test('lluvia_72h suma solo lo observado y pronostico_24h solo lo que viene', () => {
  const { serie: s, ahora } = serie({ 20: 100, 30: 10, 95: 5, 96: 7, 119: 3 });
  const v = calcularVariables(s, ahora, 'alta');
  assert.equal(v.lluvia72hMm, 15);
  assert.equal(v.pronostico24hMm, 10);
  assert.equal(v.suelo, 0.25);
});

test('lluvia_24h toma la peor ventana de 24 horas mezclando observado y pronóstico', () => {
  const { serie: s, ahora } = serie({ 71: 50, 85: 12, 100: 20, 118: 9 });
  // La hora 71 queda fuera (más de 24 h atrás); la mejor ventana junta las horas 85 y 100.
  assert.equal(calcularVariables(s, ahora, 'alta').lluvia24hMm, 32);
});

test('falla si la serie no cubre el momento pedido', () => {
  const { serie: s } = serie({ 0: 0 });
  assert.throws(() => calcularVariables(s, new Date((s.tiempos[119]! + 7200) * 1000), 'alta'));
  assert.throws(() => calcularVariables(s, new Date(s.tiempos[110]! * 1000), 'alta'));
});
