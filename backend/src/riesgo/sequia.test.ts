import assert from 'node:assert/strict';
import { test } from 'node:test';
import { acumulado, evaluarSequia, promediosPorDia } from './sequia';

test('sequía: el nivel sale del cociente entre lo llovido y lo normal', () => {
  assert.equal(evaluarSequia(80, 100, '2026-02-01').nivel, 'verde');
  assert.equal(evaluarSequia(79, 100, '2026-02-01').nivel, 'amarillo');
  assert.equal(evaluarSequia(59, 100, '2026-02-01').nivel, 'naranja');
  const rojo = evaluarSequia(39, 100, '2026-02-01');
  assert.equal(rojo.nivel, 'rojo');
  assert.equal(rojo.variables.cociente, 0.39);
  assert.match(rojo.motivos[0]!.texto, /39 mm.*100 mm.*39 %/);
});

test('sequía: en época seca no hay nivel, aunque el cociente sería extremo', () => {
  const r = evaluarSequia(0, 3, '2026-08-31');
  assert.equal(r.nivel, null);
  assert.equal(r.variables.cociente, null);
  assert.equal(r.motivos[0]!.codigo, 'epoca_seca');
});

test('sequía: acumulado y promedio por día del año', () => {
  const fechas = ['2000-01-01', '2000-01-02', '2000-01-03', '2001-01-01', '2001-01-02', '2001-01-03', '2002-01-03'];
  const lluvia = [1, 2, 3, 10, null, 30, 500];
  assert.equal(acumulado(lluvia, 2, 2), 5);
  assert.equal(acumulado(lluvia, 0, 2), null);
  // La serie es corrida: el 01-01 de 2001 suma el día anterior de la lista (3 + 10). El 01-01 de 2000 no tiene ventana completa.
  // 01-03: (2+3) en 2000 y (0+30) en 2001; 2002 queda fuera del período.
  assert.deepEqual(promediosPorDia(fechas, lluvia, 2, 2000, 2001), { '01-01': 13, '01-02': 6.5, '01-03': 17.5 });
});
