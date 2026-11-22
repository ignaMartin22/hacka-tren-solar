// DATOS DE EJEMPLO, NO REALES.
// Las fechas (año 2099), las lluvias y la humedad del suelo están inventadas para probar
// la pantalla del Modo Replay: NO corresponden a ningún evento real de la Quebrada.
// Los niveles y los motivos se calculan con el mismo motor de reglas del backend
// (backend/src/riesgo/aludes.ts), así el "por qué" suena igual que con datos reales.
import { evaluarAludes } from '../../../backend/src/riesgo/aludes';
import type { VariablesAludes } from '../../../backend/src/tipos';
import { ZONAS } from '../../../config/zonas';
import type { EventoReplay, IndiceReplay, ZonaDiaReplay } from '../replay/tipos';

// [lluvia24hMm, lluvia72hMm, pronostico24hMm, suelo] por zona y por día (8 días).
// Secuencia inventada: lluvias crecientes sobre suelo cada vez más húmedo,
// de verde a rojo, con el peor día al final (día del evento).
type Fila = [lluvia24hMm: number, lluvia72hMm: number, pronostico24hMm: number, suelo: number];

const VARIABLES: Record<string, Fila[]> = {
  volcan: [
    [4, 6, 2, 0.22],
    [9, 11, 4, 0.27],
    [17, 22, 6, 0.3],
    [22, 40, 10, 0.33],
    [29, 60, 12, 0.36],
    [38, 78, 15, 0.38],
    [47, 96, 18, 0.39],
    [62, 128, 20, 0.42],
  ],
  tumbaya: [
    [5, 7, 2, 0.23],
    [10, 12, 4, 0.28],
    [18, 24, 6, 0.31],
    [23, 42, 9, 0.34],
    [27, 58, 11, 0.35],
    [36, 74, 14, 0.37],
    [41, 88, 16, 0.38],
    [55, 118, 18, 0.41],
  ],
  purmamarca: [
    [3, 5, 1, 0.21],
    [8, 10, 3, 0.26],
    [15, 19, 5, 0.29],
    [20, 36, 8, 0.32],
    [24, 50, 9, 0.34],
    [28, 64, 11, 0.36],
    [35, 80, 13, 0.37],
    [48, 105, 16, 0.4],
  ],
  maimara: [
    [2, 4, 1, 0.2],
    [6, 8, 2, 0.24],
    [11, 14, 4, 0.27],
    [16, 28, 6, 0.3],
    [19, 40, 7, 0.33],
    [26, 58, 10, 0.34],
    [30, 68, 11, 0.35],
    [38, 92, 13, 0.38],
  ],
  tilcara: [
    [2, 3, 1, 0.2],
    [5, 7, 2, 0.24],
    [10, 13, 4, 0.27],
    [15, 26, 6, 0.3],
    [17, 37, 6, 0.32],
    [22, 50, 8, 0.33],
    [26, 60, 10, 0.34],
    [32, 84, 11, 0.36],
  ],
  humahuaca: [
    [1, 2, 0, 0.19],
    [4, 5, 2, 0.22],
    [7, 9, 3, 0.24],
    [11, 19, 4, 0.27],
    [14, 26, 5, 0.29],
    [17, 34, 6, 0.3],
    [20, 44, 7, 0.31],
    [24, 56, 8, 0.33],
  ],
};

// Fechas claramente ficticias: año 2099. El último día es el día del evento.
const FECHAS = [
  '2099-01-03',
  '2099-01-04',
  '2099-01-05',
  '2099-01-06',
  '2099-01-07',
  '2099-01-08',
  '2099-01-09',
  '2099-01-10',
];

const ZONAS_QUEBRADA = ZONAS.filter((z) => z.region === 'Quebrada');

function zonaDia(zonaId: string, nombre: string, fila: Fila): ZonaDiaReplay {
  const zona = ZONAS_QUEBRADA.find((z) => z.id === zonaId);
  const [lluvia24hMm, lluvia72hMm, pronostico24hMm, suelo] = fila;
  const variables: VariablesAludes = {
    lluvia24hMm,
    lluvia72hMm,
    pronostico24hMm,
    suelo,
    pendiente: zona?.pendiente ?? 'media',
  };
  const { nivel, motivos } = evaluarAludes(variables);
  return { zonaId, nombre, nivel, motivos, variables };
}

export const EVENTO_REPLAY_EJEMPLO: EventoReplay = {
  id: 'evento-de-ejemplo',
  titulo: 'Evento de ejemplo',
  descripcion:
    'Secuencia inventada para mostrar cómo el semáforo sube día a día antes de una lluvia fuerte. No es un evento real.',
  fuente: null,
  verificado: false,
  diaEvento: FECHAS.at(-1)!,
  dias: FECHAS.map((fecha, i) => ({
    fecha,
    zonas: ZONAS_QUEBRADA.map((z) => zonaDia(z.id, z.nombre, VARIABLES[z.id]![i]!)),
  })),
};

export const INDICE_REPLAY_EJEMPLO: IndiceReplay = {
  eventos: [
    {
      id: EVENTO_REPLAY_EJEMPLO.id,
      titulo: EVENTO_REPLAY_EJEMPLO.titulo,
      diaEvento: EVENTO_REPLAY_EJEMPLO.diaEvento,
      verificado: EVENTO_REPLAY_EJEMPLO.verificado,
    },
  ],
};
