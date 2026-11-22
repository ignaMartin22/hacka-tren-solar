import cors from 'cors';
import express from 'express';
import { ACTUALIZACION } from '../../config/riesgo';
import { ZONAS } from '../../config/zonas';
import { cargarLecturasGuardadas } from './servicios/almacen';
import { actualizar, obtenerEstados, recalcular } from './servicios/estado';

try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch {
  // Sin archivo .env: se usan las variables del entorno.
}

const PORT = Number(process.env.PORT) || 3001;
const JOB_SECRET = process.env.JOB_SECRET ?? '';

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

// Para el cron externo (el servicio gratuito de Render se duerme). Requiere el secreto en el header x-job-secret.
app.post('/api/jobs/run', async (req, res) => {
  if (!JOB_SECRET || req.get('x-job-secret') !== JOB_SECRET) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  res.json(await actualizar());
});

if (await cargarLecturasGuardadas()) recalcular();
app.listen(PORT, () => console.log(`Yaku backend escuchando en http://localhost:${PORT}`));
await actualizar();
setInterval(actualizar, ACTUALIZACION.aludesCadaHoras * 3600 * 1000);
