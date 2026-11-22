import { randomUUID } from 'node:crypto';
import type { Nivel } from '../../../config/riesgo';
import { ZONAS, type Zona } from '../../../config/zonas';
import { almacen, persistir } from '../servicios/almacen';
import type { Aviso, EstadoZona, Motivo } from '../tipos';
import { textoAviso } from './mensajes';
import { decidirAviso, envioSegunNivel, type Decision } from './reglas';

type Enviador = (chatId: number, texto: string) => Promise<unknown>;
let enviador: Enviador | null = null;

// El bot de Telegram se registra acá cuando está configurado.
export const configurarEnvio = (e: Enviador) => {
  enviador = e;
};

export const hayCanal = (): boolean => enviador !== null;

async function enviarAVecinos(aviso: Aviso): Promise<void> {
  if (!enviador) {
    aviso.envioVecinos = 'sin_canal';
    return;
  }
  const chats = almacen.suscriptores.filter((s) => s.zonaId === aviso.zonaId).map((s) => s.chatId);
  const resultados = await Promise.allSettled(chats.map((chatId) => enviador!(chatId, aviso.texto)));
  aviso.destinatarios = resultados.filter((r) => r.status === 'fulfilled').length;
  aviso.envioVecinos = 'enviado';
  aviso.enviadoEn = new Date().toISOString();
}

async function crearAviso(zona: Zona, decision: Decision, motivos: Motivo[], simulacro: boolean, ahora: Date): Promise<Aviso> {
  const aviso: Aviso = {
    id: randomUUID(),
    zonaId: zona.id,
    zonaNombre: zona.nombre,
    tipo: decision.tipo,
    nivel: decision.nivel,
    simulacro,
    texto: textoAviso(decision.tipo, decision.nivel, zona.nombre, simulacro),
    motivos,
    creadoEn: ahora.toISOString(),
    envioVecinos: decision.envioVecinos === 'enviar' ? 'sin_canal' : decision.envioVecinos,
    enviadoEn: null,
    destinatarios: 0,
  };
  if (decision.envioVecinos === 'enviar') await enviarAVecinos(aviso);
  almacen.avisos.push(aviso);
  return aviso;
}

// Compara el nivel nuevo de cada zona con el anterior y genera los avisos que correspondan.
export async function procesarAvisos(estados: EstadoZona[], ahora = new Date()): Promise<Aviso[]> {
  const nuevos: Aviso[] = [];
  for (const estado of estados) {
    const zona = ZONAS.find((z) => z.id === estado.zonaId);
    // Por ahora solo hay avisos de aludes.
    if (!zona || zona.amenaza !== 'aludes' || estado.nivel === null) continue;
    if (estado.nivel !== 'rojo')
      for (const a of almacen.avisos)
        if (a.zonaId === zona.id && !a.simulacro && a.envioVecinos === 'pendiente_confirmacion') a.envioVecinos = 'vencido';
    const previo = almacen.nivelesPrevios[zona.id] ?? 'verde';
    const decision = decidirAviso(previo, estado.nivel, almacen.avisos.filter((a) => a.zonaId === zona.id), ahora);
    if (decision) nuevos.push(await crearAviso(zona, decision, estado.motivos, false, ahora));
    almacen.nivelesPrevios[zona.id] = estado.nivel;
  }
  await Promise.all([persistir('avisos'), persistir('nivelesPrevios')]);
  return nuevos;
}

// Aviso de prueba generado desde el panel. Sigue las mismas reglas de envío que uno real y queda marcado como simulacro.
export async function crearSimulacro(zonaId: string, nivel: Nivel): Promise<Aviso | null> {
  const zona = ZONAS.find((z) => z.id === zonaId);
  if (!zona || nivel === 'verde') return null;
  const motivos: Motivo[] = [{ codigo: 'simulacro', texto: 'Simulacro generado desde el panel. No refleja datos reales.' }];
  const aviso = await crearAviso(zona, { tipo: 'alerta', nivel, envioVecinos: envioSegunNivel(nivel) }, motivos, true, new Date());
  await persistir('avisos');
  return aviso;
}

// Una persona responsable confirma un rojo pendiente: recién ahí sale a los vecinos.
export async function confirmarAviso(id: string): Promise<Aviso | null> {
  const aviso = almacen.avisos.find((a) => a.id === id);
  if (!aviso || aviso.envioVecinos !== 'pendiente_confirmacion') return null;
  await enviarAVecinos(aviso);
  await persistir('avisos');
  return aviso;
}

export const historial = (limite = 100): Aviso[] => almacen.avisos.slice(-limite).reverse();
export const pendientes = (): Aviso[] => almacen.avisos.filter((a) => a.envioVecinos === 'pendiente_confirmacion').reverse();
