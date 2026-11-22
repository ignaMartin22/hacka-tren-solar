import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { NIVELES, type Nivel } from '../../config/riesgo';
import { confirmarAviso, crearSimulacro, hayCanal, pendientes } from './avisos/servicio';
import { cantidadPorZona } from './avisos/suscriptores';
import { almacen } from './servicios/almacen';

const HORAS_DE_SESION = 12;

const hash = (s: string) => createHash('sha256').update(s).digest();
const iguales = (a: string, b: string) => timingSafeEqual(hash(a), hash(b));
const firmar = (clave: string, vence: number) => createHmac('sha256', clave).update(String(vence)).digest('hex');

// Vista institucional: login simple con una clave compartida (ADMIN_PASSWORD) y un token firmado que vence.
export function crearRouterAdmin(clave: string): Router {
  const router = Router();

  router.post('/login', (req, res) => {
    if (!clave) {
      res.status(503).json({ error: 'El panel no está configurado: falta ADMIN_PASSWORD en el servidor.' });
      return;
    }
    if (!iguales(String(req.body?.clave ?? ''), clave)) {
      res.status(401).json({ error: 'Clave incorrecta' });
      return;
    }
    const vence = Date.now() + HORAS_DE_SESION * 3600 * 1000;
    res.json({ token: `${vence}.${firmar(clave, vence)}`, venceEn: new Date(vence).toISOString() });
  });

  // Todo lo que sigue requiere el header Authorization: Bearer <token>.
  router.use((req, res, next) => {
    const [vence = '', firma = ''] = (req.get('authorization') ?? '').replace(/^Bearer /, '').split('.');
    if (!clave || !(Number(vence) > Date.now()) || !iguales(firma, firmar(clave, Number(vence)))) {
      res.status(401).json({ error: 'Sesión inválida o vencida' });
      return;
    }
    next();
  });

  router.get('/avisos/pendientes', (_req, res) => {
    res.json(pendientes());
  });

  router.post('/avisos/:id/confirmar', async (req, res) => {
    if (!hayCanal()) {
      res.status(503).json({ error: 'No se puede enviar: el bot de Telegram no está activo. El aviso sigue pendiente.' });
      return;
    }
    const aviso = await confirmarAviso(req.params.id);
    if (!aviso) {
      res.status(404).json({ error: 'No hay un aviso pendiente de confirmación con ese id' });
      return;
    }
    res.json(aviso);
  });

  // Genera un aviso de prueba (marcado como simulacro) para mostrar el circuito completo.
  router.post('/simulacros', async (req, res) => {
    const nivel = String(req.body?.nivel ?? '') as Nivel;
    const aviso = NIVELES.includes(nivel) ? await crearSimulacro(String(req.body?.zonaId ?? ''), nivel) : null;
    if (!aviso) {
      res.status(400).json({ error: 'Se necesita zonaId válido y nivel amarillo, naranja o rojo' });
      return;
    }
    res.status(201).json(aviso);
  });

  router.get('/suscriptores', (_req, res) => {
    res.json({ total: almacen.suscriptores.length, porZona: cantidadPorZona() });
  });

  return router;
}
