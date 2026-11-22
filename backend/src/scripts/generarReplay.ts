// Genera los JSON precalculados del Modo Replay en data/replay/ (uno por evento de config/eventos.ts).
// Uso: pnpm replay            (todos los eventos)
//      pnpm replay <id>       (uno solo)
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EVENTOS, type EventoReplay } from '../../../config/eventos';
import { UMBRALES_ALUDES } from '../../../config/riesgo';
import { ZONAS } from '../../../config/zonas';
import { generarPasos, horasDeAnticipacion, resumirDias, sumarDias } from '../riesgo/replay';
import { consultarHistorico } from '../servicios/openMeteo';

const CARPETA = fileURLToPath(new URL('../../../data/replay/', import.meta.url));
const CADA_HORAS = 3;

async function generar(evento: EventoReplay) {
  const zonas = ZONAS.filter((z) => z.amenaza === 'aludes');
  const desde = sumarDias(evento.fecha, -evento.diasPrevios);
  // Margen: 72 h hacia atrás para la lluvia de 3 días y 24 h hacia adelante para la ventana de pronóstico.
  const lecturas = await consultarHistorico(zonas, sumarDias(desde, -4), sumarDias(evento.fecha, 2));

  const salida = {
    evento,
    generadoEn: new Date().toISOString(),
    fuente: 'Open-Meteo, reanálisis histórico ERA5 (datos satelitales y de modelos meteorológicos)',
    precalculado: true,
    cadaHoras: CADA_HORAS,
    desde,
    hasta: evento.fecha,
    umbrales: UMBRALES_ALUDES,
    notas: [
      'Precalculado: el mismo motor de aludes del semáforo en vivo, corrido cada 3 horas sobre datos históricos.',
      'Es una reconstrucción con reanálisis, no lo que Yaku habría mostrado ese día: en "nivel" la lluvia de las 24 horas siguientes ya se conoce (pronóstico perfecto). "nivelSoloObservado" usa solo lo que ya había llovido.',
      'El reanálisis tiene celdas de unos 9 km y puede no ubicar bien la hora ni la intensidad de una tormenta local.',
      'Umbrales iniciales, sin validar científicamente.',
    ],
    zonas: lecturas.map((lectura) => {
      const zona = zonas.find((z) => z.id === lectura.zonaId)!;
      const pasos = generarPasos(lectura.serie, zona.pendiente, desde, evento.fecha, CADA_HORAS);
      const hora = evento.horaLocal ?? 0;
      return {
        zonaId: zona.id,
        nombre: zona.nombre,
        afectada: evento.zonasAfectadas.includes(zona.id),
        celda: lectura.celda,
        // Horas entre el primer rojo y la hora del evento. null si no hubo rojo antes o si no se conoce la hora.
        anticipacionRojoHoras: evento.horaLocal === null ? null : horasDeAnticipacion(pasos, 'nivel', 'rojo', evento.fecha, hora),
        anticipacionRojoSoloObservadoHoras: evento.horaLocal === null ? null : horasDeAnticipacion(pasos, 'nivelSoloObservado', 'rojo', evento.fecha, hora),
        dias: resumirDias(lectura.serie, pasos),
        pasos,
      };
    }),
  };

  await mkdir(CARPETA, { recursive: true });
  await writeFile(`${CARPETA}${evento.id}.json`, `${JSON.stringify(salida)}\n`);
  console.log(`\n${evento.id}`);
  for (const z of salida.zonas)
    console.log(
      `  ${z.nombre.padEnd(11)} ${z.dias.map((d) => `${d.fechaLocal.slice(8)}:${d.nivelMaximo[0]}/${d.nivelMaximoSoloObservado[0]}(${d.lluviaMm})`).join(' ')}  rojo ${z.anticipacionRojoHoras}h / ${z.anticipacionRojoSoloObservadoHoras}h`,
    );
}

const pedido = process.argv[2];
const eventos = pedido ? EVENTOS.filter((e) => e.id === pedido) : EVENTOS;
if (eventos.length === 0) throw new Error(`No existe el evento "${pedido}". Disponibles: ${EVENTOS.map((e) => e.id).join(', ')}`);
for (const evento of eventos) await generar(evento);
