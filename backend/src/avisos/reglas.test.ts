import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Aviso } from '../tipos';
import { textoAviso } from './mensajes';
import { decidirAviso } from './reglas';

const ahora = new Date('2026-01-10T12:00:00Z');
const haceHoras = (h: number) => new Date(ahora.getTime() - h * 3600 * 1000).toISOString();
const aviso = (parcial: Partial<Aviso>): Aviso => ({
  id: 'x',
  zonaId: 'volcan',
  zonaNombre: 'Volcán',
  tipo: 'alerta',
  nivel: 'naranja',
  simulacro: false,
  texto: '',
  motivos: [],
  creadoEn: haceHoras(1),
  envioVecinos: 'enviado',
  enviadoEn: haceHoras(1),
  destinatarios: 3,
  ...parcial,
});

test('solo avisa cuando el nivel sube', () => {
  assert.equal(decidirAviso('verde', 'verde', [], ahora), null);
  assert.equal(decidirAviso('naranja', 'naranja', [], ahora), null);
  assert.equal(decidirAviso('rojo', 'naranja', [], ahora), null);
  assert.equal(decidirAviso('naranja', 'amarillo', [], ahora), null);
});

test('amarillo no va a vecinos, naranja sale solo y rojo espera confirmación', () => {
  assert.deepEqual(decidirAviso('verde', 'amarillo', [], ahora), { tipo: 'alerta', nivel: 'amarillo', envioVecinos: 'no_corresponde' });
  assert.deepEqual(decidirAviso('amarillo', 'naranja', [], ahora), { tipo: 'alerta', nivel: 'naranja', envioVecinos: 'enviar' });
  assert.deepEqual(decidirAviso('verde', 'rojo', [], ahora), { tipo: 'alerta', nivel: 'rojo', envioVecinos: 'pendiente_confirmacion' });
});

test('no repite el mismo nivel dentro del tope de horas', () => {
  assert.equal(decidirAviso('amarillo', 'naranja', [aviso({ creadoEn: haceHoras(2) })], ahora), null);
  assert.notEqual(decidirAviso('amarillo', 'naranja', [aviso({ creadoEn: haceHoras(7) })], ahora), null);
  // Un simulacro o un aviso de otro nivel no cuentan para el tope.
  assert.notEqual(decidirAviso('amarillo', 'naranja', [aviso({ simulacro: true })], ahora), null);
  assert.notEqual(decidirAviso('naranja', 'rojo', [aviso({ creadoEn: haceHoras(2) })], ahora), null);
});

test('al volver a verde avisa el fin, y a los vecinos solo si habían sido avisados', () => {
  assert.deepEqual(decidirAviso('amarillo', 'verde', [aviso({ nivel: 'amarillo', envioVecinos: 'no_corresponde' })], ahora), {
    tipo: 'fin_alerta',
    nivel: 'verde',
    envioVecinos: 'no_corresponde',
  });
  assert.equal(decidirAviso('naranja', 'verde', [aviso({ creadoEn: haceHoras(5) })], ahora)?.envioVecinos, 'enviar');
  // Si ya hubo un fin de alerta después de esa alerta, el episodio está cerrado.
  const cerrado = [aviso({ creadoEn: haceHoras(30) }), aviso({ tipo: 'fin_alerta', nivel: 'verde', creadoEn: haceHoras(20) })];
  assert.equal(decidirAviso('amarillo', 'verde', cerrado, ahora)?.envioVecinos, 'no_corresponde');
});

test('el mensaje dice nivel, zona y qué hacer, y marca los simulacros', () => {
  const texto = textoAviso('alerta', 'naranja', 'Tumbaya', false);
  assert.match(texto, /^YAKU · NARANJA · Tumbaya\n/);
  assert.match(texto, /Evitá cruzar ríos y quebradas/);
  assert.match(textoAviso('alerta', 'rojo', 'Volcán', true), /^SIMULACRO/);
  assert.match(textoAviso('fin_alerta', 'verde', 'Volcán', false), /^YAKU · FIN DE ALERTA · Volcán\n/);
});
