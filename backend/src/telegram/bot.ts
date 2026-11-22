import { Bot, InlineKeyboard, type Context } from 'grammy';
import { ZONAS, type Zona } from '../../../config/zonas';
import { darDeBaja, suscribir, zonasDe } from '../avisos/suscriptores';
import { obtenerEstados } from '../servicios/estado';

// Por ahora solo hay avisos de aludes, así que solo se ofrecen esas zonas.
const ZONAS_CON_AVISOS = ZONAS.filter((z) => z.amenaza === 'aludes');

function teclado(): InlineKeyboard {
  const k = new InlineKeyboard();
  ZONAS_CON_AVISOS.forEach((z, i) => {
    k.text(z.nombre, `zona:${z.id}`);
    if (i % 2 === 1) k.row();
  });
  return k;
}

const nivelDe = (zonaId: string): string => obtenerEstados().zonas.find((z) => z.zonaId === zonaId)?.nivel?.toUpperCase() ?? 'SIN DATO';

async function confirmarSuscripcion(ctx: Context, zona: Zona): Promise<void> {
  if (!ctx.chat) return;
  const nueva = await suscribir(ctx.chat.id, zona.id);
  const estado = obtenerEstados().zonas.find((z) => z.zonaId === zona.id);
  await ctx.reply(
    [
      nueva ? `Listo. Vas a recibir los avisos de ${zona.nombre}.` : `Ya estabas suscripto a ${zona.nombre}.`,
      `Nivel actual: ${nivelDe(zona.id)}.`,
      ...(estado?.motivos.map((m) => m.texto) ?? []),
      'Ver tus zonas: /zonas. Dejar de recibir avisos: /baja.',
    ].join('\n'),
  );
}

export function crearBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    // El enlace https://t.me/<bot>?start=<zonaId> suscribe directo a esa zona.
    const zona = ZONAS_CON_AVISOS.find((z) => z.id === ctx.match.trim());
    if (zona) return confirmarSuscripcion(ctx, zona);
    await ctx.reply('Hola, soy Yaku. Te aviso cuando sube el riesgo de aludes en tu zona.\n¿De qué zona querés recibir avisos?', {
      reply_markup: teclado(),
    });
  });

  bot.callbackQuery(/^zona:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const zona = ZONAS_CON_AVISOS.find((z) => z.id === ctx.match[1]);
    if (zona) await confirmarSuscripcion(ctx, zona);
  });

  bot.command('zonas', async (ctx) => {
    const mias = zonasDe(ctx.chat.id);
    const lineas = ZONAS_CON_AVISOS.map((z) => `${z.nombre}: ${nivelDe(z.id)}${mias.includes(z.id) ? ' (recibís avisos)' : ''}`);
    await ctx.reply(`${lineas.join('\n')}\n\nTocá una zona para sumarla:`, { reply_markup: teclado() });
  });

  bot.command('baja', async (ctx) => {
    const cuantas = await darDeBaja(ctx.chat.id);
    await ctx.reply(cuantas > 0 ? 'Listo. Ya no vas a recibir avisos de Yaku. Para volver: /start.' : 'No tenías ninguna zona activa. Para suscribirte: /start.');
  });

  bot.catch((e) => console.error('Error en el bot de Telegram:', e.message));
  return bot;
}
