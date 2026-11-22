import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { Express, RequestHandler } from 'express';
import { NIVELES, type Nivel } from '../../config/riesgo';
import { confirmarAviso, crearSimulacro, hayCanal, historial, pendientes } from './avisos/servicio';
import { cantidadPorZona } from './avisos/suscriptores';
import { almacen } from './servicios/almacen';
import type { Aviso } from './tipos';

const HORAS_DE_SESION = 12;

const hash = (s: string) => createHash('sha256').update(s).digest();
const iguales = (a: string, b: string) => timingSafeEqual(hash(a), hash(b));
const firmar = (clave: string, vence: number) => createHmac('sha256', clave).update(String(vence)).digest('hex');

// Forma que usa la vista institucional del frontend (frontend/contratos/institucional.md),
// más los campos propios del backend.
const paraPanel = (a: Aviso) => ({
  ...a,
  estado: a.envioVecinos === 'pendiente_confirmacion' ? 'pendiente-confirmacion' : 'enviado',
  mensaje: a.texto,
  // En un pendiente, a cuántas personas les llegaría si se confirma ahora.
  destinatarios: a.envioVecinos === 'pendiente_confirmacion' ? (cantidadPorZona()[a.zonaId] ?? 0) : a.destinatarios,
});

// Vista institucional: login simple con una clave compartida (ADMIN_PASSWORD) y un token firmado que vence.
export function registrarAdmin(app: Express, clave: string): void {
  const login: RequestHandler = (req, res) => {
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
  };

  // Requiere el header Authorization: Bearer <token>.
  const conSesion: RequestHandler = (req, res, next) => {
    const [vence = '', firma = ''] = (req.get('authorization') ?? '').replace(/^Bearer /, '').split('.');
    if (!clave || !(Number(vence) > Date.now()) || !iguales(firma, firmar(clave, Number(vence)))) {
      res.status(401).json({ error: 'Sesión inválida o vencida' });
      return;
    }
    next();
  };

  const confirmar: RequestHandler = async (req, res) => {
    if (!hayCanal()) {
      res.status(503).json({ error: 'No se puede enviar: el bot de Telegram no está activo. El aviso sigue pendiente.' });
      return;
    }
    const aviso = await confirmarAviso(String(req.params.id));
    if (!aviso) {
      res.status(404).json({ error: 'No hay un aviso pendiente de confirmación con ese id' });
      return;
    }
    res.json({ aviso: paraPanel(aviso) });
  };

  app.post(['/api/login', '/api/admin/login'], login);

  // Historial para el panel: avisos enviados a vecinos y rojos que esperan confirmación, del más nuevo al más viejo.
  app.get('/api/avisos', conSesion, (_req, res) => {
    res.json({ avisos: historial().filter((a) => a.envioVecinos === 'enviado' || a.envioVecinos === 'pendiente_confirmacion').map(paraPanel) });
  });
  app.post(['/api/avisos/:id/confirmar', '/api/admin/avisos/:id/confirmar'], conSesion, confirmar);

  // Historial completo, incluidos los avisos que no van a vecinos (amarillo), vencidos y sin canal.
  app.get('/api/admin/avisos', conSesion, (_req, res) => {
    res.json({ avisos: historial().map(paraPanel) });
  });
  app.get('/api/admin/avisos/pendientes', conSesion, (_req, res) => {
    res.json({ avisos: pendientes().map(paraPanel) });
  });

  // Genera un aviso de prueba (marcado como simulacro) para mostrar el circuito completo.
  app.post('/api/admin/simulacros', conSesion, async (req, res) => {
    const nivel = String(req.body?.nivel ?? '') as Nivel;
    const aviso = NIVELES.includes(nivel) ? await crearSimulacro(String(req.body?.zonaId ?? ''), nivel) : null;
    if (!aviso) {
      res.status(400).json({ error: 'Se necesita zonaId válido y nivel amarillo, naranja o rojo' });
      return;
    }
    res.status(201).json({ aviso: paraPanel(aviso) });
  });

  app.get('/api/admin/suscriptores', conSesion, (_req, res) => {
    res.json({ total: almacen.suscriptores.length, porZona: cantidadPorZona() });
  });
}
