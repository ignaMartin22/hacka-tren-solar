import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { test } from 'node:test';
import type { Nivel } from '../../../config/riesgo';
import type { EstadoZona } from '../tipos';

// El almacén escribe en una carpeta temporal para no tocar los datos reales.
process.env.DATOS_DIR = mkdtempSync(join(tmpdir(), 'yaku-test-')) + sep;
const { almacen } = await import('../servicios/almacen');
const { configurarEnvio, confirmarAviso, crearSimulacro, pendientes, procesarAvisos } = await import('./servicio');

const estado = (zonaId: string, nivel: Nivel): EstadoZona[] => [
  { zonaId, nombre: zonaId, region: 'Quebrada', amenaza: 'aludes', lat: 0, lon: 0, nivel, motivos: [], variables: null, sequia: null, aviso: null, tendencia: [], celda: null, datosDe: null, calculadoEn: null },
];
const enviados: { chatId: number; texto: string }[] = [];
let hora = Date.parse('2026-01-10T00:00:00Z');
// Cada paso ocurre 7 horas después del anterior, para no chocar con el tope por nivel.
const despues = () => new Date((hora += 7 * 3600 * 1000));

test('sin bot configurado el aviso queda registrado como sin_canal', async () => {
  const aviso = await crearSimulacro('tilcara', 'naranja');
  assert.equal(aviso?.envioVecinos, 'sin_canal');
  assert.equal(aviso?.simulacro, true);
  assert.equal(await crearSimulacro('no-existe', 'naranja'), null);
});

test('naranja sale solo, rojo espera confirmación y al volver a verde se avisa el fin', async () => {
  configurarEnvio(async (chatId, texto) => {
    if (chatId === 99) throw new Error('chat bloqueado');
    enviados.push({ chatId, texto });
  });
  almacen.suscriptores = [
    { chatId: 1, zonaId: 'volcan', creadoEn: '' },
    { chatId: 2, zonaId: 'volcan', creadoEn: '' },
    { chatId: 99, zonaId: 'volcan', creadoEn: '' },
    { chatId: 3, zonaId: 'tilcara', creadoEn: '' },
  ];

  const [naranja] = await procesarAvisos(estado('volcan', 'naranja'), despues());
  assert.equal(naranja?.envioVecinos, 'enviado');
  // Solo cuenta a quienes les llegó; el chat que falla no suma.
  assert.equal(naranja?.destinatarios, 2);
  assert.deepEqual(enviados.map((e) => e.chatId), [1, 2]);

  // Mismo nivel otra vez: no se repite.
  assert.deepEqual(await procesarAvisos(estado('volcan', 'naranja'), despues()), []);

  const [rojo] = await procesarAvisos(estado('volcan', 'rojo'), despues());
  assert.equal(rojo?.envioVecinos, 'pendiente_confirmacion');
  assert.equal(enviados.length, 2);
  assert.deepEqual(pendientes().map((a) => a.id), [rojo!.id]);

  const confirmado = await confirmarAviso(rojo!.id);
  assert.equal(confirmado?.envioVecinos, 'enviado');
  assert.equal(confirmado?.destinatarios, 2);
  assert.match(enviados.at(-1)!.texto, /^YAKU · ROJO · Volcán/);
  assert.equal(await confirmarAviso(rojo!.id), null);

  const [fin] = await procesarAvisos(estado('volcan', 'verde'), despues());
  assert.equal(fin?.tipo, 'fin_alerta');
  assert.equal(fin?.destinatarios, 2);
  assert.equal(enviados.length, 6);
});

test('un rojo sin confirmar vence si el nivel baja', async () => {
  const [rojo] = await procesarAvisos(estado('humahuaca', 'rojo'), despues());
  assert.equal(rojo?.envioVecinos, 'pendiente_confirmacion');
  await procesarAvisos(estado('humahuaca', 'naranja'), despues());
  assert.equal(rojo?.envioVecinos, 'vencido');
  assert.equal(await confirmarAviso(rojo!.id), null);
});
