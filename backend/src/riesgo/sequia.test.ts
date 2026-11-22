import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluarSequia, promedioHistorico } from './sequia';

const nivel = (lluvia: number, promedio: number) => evaluarSequia(lluvia, promedio, '2026-01-01', '2026-03-31').nivel;

test('el nivel sale del cociente entre lo llovido y lo habitual', () => {
  assert.equal(nivel(100, 100), 'verde');
  assert.equal(nivel(80, 100), 'verde');
  assert.equal(nivel(79, 100), 'amarillo');
  assert.equal(nivel(60, 100), 'amarillo');
  assert.equal(nivel(59, 100), 'naranja');
  assert.equal(nivel(40, 100), 'naranja');
  assert.equal(nivel(39, 100), 'rojo');
  assert.equal(nivel(0, 100), 'rojo');
});

test('en época seca no hay nivel y se explica por qué', () => {
  const r = evaluarSequia(0, 19.9, '2026-06-01', '2026-08-29');
  assert.equal(r.nivel, null);
  assert.equal(r.variables.cociente, null);
  assert.match(r.aviso!, /^Época seca, sin dato/);
  assert.equal(nivel(5, 20), 'rojo');
});

test('el motivo explica el porqué con los valores', () => {
  const r = evaluarSequia(45, 100, '2026-01-01', '2026-03-31');
  assert.equal(r.variables.cociente, 0.45);
  assert.match(r.motivos[0]!.texto, /entre el 01\/01 y el 31\/03\) llovieron 45 mm.*100 mm.*45 % de lo normal/);
});

test('el promedio histórico suma el promedio de cada día del año', () => {
  assert.equal(promedioHistorico({ '01-01': 2, '01-02': 3, '02-29': 1 }, ['2026-01-01', '2027-01-02', '2028-02-29', '2026-05-05']), 6);
});
