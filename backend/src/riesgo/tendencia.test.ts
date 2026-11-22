import assert from 'node:assert/strict';
import { test } from 'node:test';
import { instanteLocal } from '../hora';
import type { SerieHoraria } from '../tipos';
import { calcularTendencia } from './tendencia';

// Serie de 13 días desde las 00:00 (hora de Jujuy) del 01/01/2026. `ahora` cae el día 11 a las 10:30.
function serie(lluvia: Record<number, number>): { serie: SerieHoraria; ahora: Date } {
  const t0 = instanteLocal('2026-01-01');
  const tiempos = Array.from({ length: 13 * 24 }, (_, i) => t0 + i * 3600);
  return {
    serie: { tiempos, lluviaMm: tiempos.map((_, i) => lluvia[i] ?? 0), suelo: tiempos.map(() => 0.2) },
    ahora: new Date((instanteLocal('2026-01-11', 10) + 1800) * 1000),
  };
}

test('devuelve los últimos 7 días, con hoy al final', () => {
  const { serie: s, ahora } = serie([]);
  const tendencia = calcularTendencia(s, ahora, 'alta');
  assert.deepEqual(tendencia.map((d) => d.fecha), ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09', '2026-01-10', '2026-01-11']);
  assert.ok(tendencia.every((d) => d.nivel === 'verde' && d.lluviaMm === 0));
});

test('cada día guarda su lluvia y el nivel más alto que alcanzó', () => {
  // 20 mm el 08/01 entre las 14:00 y las 15:00 (hora 7 * 24 + 15).
  const { serie: s, ahora } = serie({ [7 * 24 + 15]: 20 });
  const porFecha = Object.fromEntries(calcularTendencia(s, ahora, 'alta').map((d) => [d.fecha, d]));
  assert.equal(porFecha['2026-01-08']!.lluviaMm, 20);
  assert.equal(porFecha['2026-01-08']!.nivel, 'amarillo');
  // El día anterior ya estaba en amarillo: la lluvia entraba en la ventana de las 24 horas siguientes.
  assert.equal(porFecha['2026-01-07']!.nivel, 'amarillo');
  assert.equal(porFecha['2026-01-07']!.lluviaMm, 0);
  assert.equal(porFecha['2026-01-06']!.nivel, 'verde');
  assert.equal(porFecha['2026-01-10']!.nivel, 'verde');
});
