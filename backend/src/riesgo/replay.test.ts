import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SerieHoraria } from '../tipos';
import { generarPasos, horasDeAnticipacion, resumirDias } from './replay';

// Serie horaria del 01/01/2020 00:00 UTC al 09/01, con 100 mm repartidos el 6 de enero entre las 12 y las 16 h de Jujuy.
function serieDePrueba(): SerieHoraria {
  const inicio = Date.parse('2020-01-01T00:00:00Z') / 1000;
  const tiempos = Array.from({ length: 24 * 9 }, (_, i) => inicio + i * 3600);
  const desde = Date.parse('2020-01-06T16:00:00Z') / 1000;
  return {
    tiempos,
    lluviaMm: tiempos.map((t) => (t >= desde && t < desde + 4 * 3600 ? 25 : 0)),
    suelo: tiempos.map(() => 0.4),
  };
}

test('el replay se pone rojo antes con pronóstico perfecto que con solo lo observado', () => {
  const pasos = generarPasos(serieDePrueba(), 'alta', '2020-01-05', '2020-01-06', 3);
  assert.equal(pasos.length, 16);
  assert.deepEqual([pasos[0]!.fechaLocal, pasos[0]!.horaLocal, pasos[0]!.t], ['2020-01-05', 0, '2020-01-05T03:00:00.000Z']);
  assert.equal(pasos[0]!.nivel, 'verde');
  assert.equal(horasDeAnticipacion(pasos, 'nivel', 'rojo', '2020-01-06', 15), 24);
  assert.equal(horasDeAnticipacion(pasos, 'nivelSoloObservado', 'rojo', '2020-01-06', 15), 0);
  assert.equal(horasDeAnticipacion(pasos, 'nivelSoloObservado', 'rojo', '2020-01-06', 12), null);
});

test('el resumen por día usa el día de Jujuy y el nivel más alto', () => {
  const serie = serieDePrueba();
  const dias = resumirDias(serie, generarPasos(serie, 'alta', '2020-01-05', '2020-01-06', 3));
  assert.deepEqual(dias, [
    { fechaLocal: '2020-01-05', lluviaMm: 0, nivelMaximo: 'rojo', nivelMaximoSoloObservado: 'verde' },
    { fechaLocal: '2020-01-06', lluviaMm: 100, nivelMaximo: 'rojo', nivelMaximoSoloObservado: 'rojo' },
  ]);
});
