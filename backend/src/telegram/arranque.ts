import { createHash } from 'node:crypto';
import type { Express } from 'express';
import { webhookCallback } from 'grammy';
import { configurarEnvio } from '../avisos/servicio';
import { crearBot } from './bot';

const RUTA_WEBHOOK = '/api/telegram/webhook';
let usuario: string | null = null;

export const infoBot = () => ({ activo: usuario !== null, usuario, enlace: usuario ? `https://t.me/${usuario}` : null });

// Con URL pública usa webhook (en Render el polling se corta cuando el servicio se duerme); sin ella, polling.
export async function iniciarBot(app: Express, token: string, urlPublica: string): Promise<void> {
  try {
    const bot = crearBot(token);
    await bot.init();
    await bot.api.setMyCommands([
      { command: 'start', description: 'Elegir una zona y recibir avisos' },
      { command: 'zonas', description: 'Ver el nivel de cada zona' },
      { command: 'baja', description: 'Dejar de recibir avisos' },
    ]);
    if (urlPublica) {
      const secreto = createHash('sha256').update(token).digest('hex');
      app.post(RUTA_WEBHOOK, webhookCallback(bot, 'express', { secretToken: secreto }));
      await bot.api.setWebhook(`${urlPublica.replace(/\/$/, '')}${RUTA_WEBHOOK}`, { secret_token: secreto });
    } else {
      await bot.api.deleteWebhook();
      void bot.start();
    }
    configurarEnvio((chatId, texto) => bot.api.sendMessage(chatId, texto));
    usuario = bot.botInfo.username;
    console.log(`Bot de Telegram activo: @${usuario} (${urlPublica ? 'webhook' : 'polling'})`);
  } catch (e) {
    console.error('No se pudo iniciar el bot de Telegram, se reintenta en 1 minuto:', e instanceof Error ? e.message : e);
    setTimeout(() => iniciarBot(app, token, urlPublica), 60_000);
  }
}
