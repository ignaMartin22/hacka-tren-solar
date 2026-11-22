import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EVENTOS } from '../../../config/eventos';
import { ZONAS } from '../../../config/zonas';
import { resumenDelDia } from '../riesgo/tendencia';
import { consultarHistorico } from '../servicios/openMeteo';

// Genera data/replay/<id>.json: el motor de aludes corrido día por día, desde 7 días antes hasta el día del evento.
// Uso: pnpm --filter yaku-backend replay <id del evento en config/eventos.ts>

const DIAS_ANTES = 7;
const sumarDias = (fecha: string, dias: number) => new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10);

const evento = EVENTOS.find((e) => e.id === process.argv[2]);
if (!evento) throw new Error(`Evento desconocido. Disponibles: ${EVENTOS.map((e) => e.id).join(', ')}`);

const zonas = ZONAS.filter((z) => z.amenaza === 'aludes');
// 3 días extra hacia atrás para las 72 horas previas, y 2 hacia adelante para las 24 horas siguientes al último día.
const lecturas = await consultarHistorico(zonas, sumarDias(evento.fechaEvento, -DIAS_ANTES - 4), sumarDias(evento.fechaEvento, 2));
const fechas = Array.from({ length: DIAS_ANTES + 1 }, (_, i) => sumarDias(evento.fechaEvento, i - DIAS_ANTES));

const replay = {
  ...evento,
  generadoEn: new Date().toISOString(),
  fuenteDatos: 'Open-Meteo Historical Weather API (reanálisis y modelos meteorológicos)',
  nota:
    'Precalculado con el mismo motor y los mismos umbrales que el semáforo en vivo. No hay pronósticos archivados de esa fecha: ' +
    'en `nivel`, la lluvia de las 24 horas siguientes sale del reanálisis y ocupa el lugar del pronóstico. ' +
    '`nivelSoloObservado` usa únicamente lo que ya había llovido hasta ese momento. ' +
    'Cada día muestra el nivel más alto que alcanzó y la hora local en que llegó a ese nivel (`desdeHora`).',
  zonas: zonas.map((zona, i) => ({
    zonaId: zona.id,
    nombre: zona.nombre,
    celda: lecturas[i]!.celda,
    dias: fechas.map((fecha) => {
      const dia = resumenDelDia(lecturas[i]!.serie, fecha, zona.pendiente);
      const observado = resumenDelDia(lecturas[i]!.serie, fecha, zona.pendiente, { soloObservado: true });
      if (!dia || !observado) throw new Error(`La serie histórica no cubre el ${fecha} en ${zona.nombre}`);
      return {
        fecha,
        esDiaDelEvento: fecha === evento.fechaEvento,
        lluviaMm: dia.lluviaMm,
        nivel: dia.nivel,
        desdeHora: dia.desdeHora,
        motivos: dia.motivos,
        variables: dia.variables,
        nivelSoloObservado: observado.nivel,
        desdeHoraSoloObservado: observado.desdeHora,
        motivosSoloObservado: observado.motivos,
      };
    }),
  })),
};

const carpeta = fileURLToPath(new URL('../../../data/replay/', import.meta.url));
await mkdir(carpeta, { recursive: true });
await writeFile(`${carpeta}${evento.id}.json`, `${JSON.stringify(replay, null, 2)}\n`);
for (const z of replay.zonas) console.log(z.nombre.padEnd(11), z.dias.map((d) => `${d.fecha.slice(5)} ${d.nivel}@${d.desdeHora}/${d.nivelSoloObservado}@${d.desdeHoraSoloObservado} ${d.lluviaMm}mm`).join(' | '));
