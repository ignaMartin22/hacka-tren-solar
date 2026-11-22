import './env';
import cors from 'cors';
import express from 'express';
import { ACTUALIZACION } from '../../config/riesgo';
import { ZONAS } from '../../config/zonas';
import { crearRouterAdmin } from './admin';
import { historial } from './avisos/servicio';
import { crearRouterReplay } from './replay';
import { almacen, cargarAlmacen } from './servicios/almacen';
import { actualizar, obtenerEstados, recalcular } from './servicios/estado';
import { actualizarSequia, actualizarSequiaSiHaceFalta } from './servicios/sequia';
import { infoBot, iniciarBot } from './telegram/arranque';

const PORT = Number(process.env.PORT) || 3001;
const JOB_SECRET = process.env.JOB_SECRET ?? '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
// Render define RENDER_EXTERNAL_URL con la URL pública del servicio.
const URL_PUBLICA = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json());

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, calculadoEn: obtenerEstados().calculadoEn });
});

app.get('/api/zonas', (_req, res) => {
  res.json(ZONAS);
});

app.get('/api/estado', (_req, res) => {
  res.json(obtenerEstados());
});

app.get('/api/estado/:zonaId', (req, res) => {
  const { zonas, ...resto } = obtenerEstados();
  const zona = zonas.find((z) => z.zonaId === req.params.zonaId);
  if (!zona) {
    res.status(404).json({ error: `No existe la zona "${req.params.zonaId}"` });
    return;
  }
  res.json({ ...resto, zona });
});

// Historial público de avisos: cuándo, a qué zona, qué nivel y a cuántas personas. No incluye datos personales.
app.get('/api/avisos', (_req, res) => {
  res.json(historial());
});

// Datos del bot para armar el enlace o el QR de suscripción.
app.get('/api/bot', (_req, res) => {
  res.json(infoBot());
});

// Modo Replay: eventos pasados precalculados.
app.use('/api/replay', await crearRouterReplay());

app.use('/api/admin', crearRouterAdmin(process.env.ADMIN_PASSWORD ?? ''));

// Para el cron externo (el servicio gratuito de Render se duerme). Requiere el secreto en el header x-job-secret.
app.post('/api/jobs/run', async (req, res) => {
  if (!JOB_SECRET || req.get('x-job-secret') !== JOB_SECRET) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  res.json(await actualizar());
});

await cargarAlmacen();
if (almacen.lecturas.length > 0) recalcular();
app.listen(PORT, () => console.log(`Yaku backend escuchando en http://localhost:${PORT}`));
if (TELEGRAM_BOT_TOKEN) void iniciarBot(app, TELEGRAM_BOT_TOKEN, URL_PUBLICA);
else console.log('Bot de Telegram desactivado: falta TELEGRAM_BOT_TOKEN.');
await actualizarSequiaSiHaceFalta();
await actualizar();
setInterval(actualizar, ACTUALIZACION.aludesCadaHoras * 3600 * 1000);
// La sequía se recalcula una vez por semana.
setInterval(async () => {
  await actualizarSequia();
  recalcular();
}, 7 * 24 * 3600 * 1000);
