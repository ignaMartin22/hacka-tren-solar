// Genera data/sequia/promedios.json (lluvia normal de 90 días por día del año, 1991-2020) y
// data/sequia/actual.json (nivel de sequía de hoy y de cada fin de mes del último año, para la ficha).
// Uso: pnpm sequia
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { UMBRALES_SEQUIA } from '../../../config/riesgo';
import { ZONAS } from '../../../config/zonas';
import { acumulado, evaluarSequia, promediosPorDia } from '../riesgo/sequia';
import { calcularSequia, consultarLluviaDiaria, type PromediosSequia } from '../servicios/sequia';

const CARPETA = fileURLToPath(new URL('../../../data/sequia/', import.meta.url));
const PERIODO = { desdeAnio: 1991, hastaAnio: 2020 };
const FUENTE = 'Open-Meteo, reanálisis histórico ERA5 (datos satelitales y de modelos meteorológicos)';

const zonas = ZONAS.filter((z) => z.amenaza === 'sequia');
const dias = UMBRALES_SEQUIA.diasVentana;
const hoy = new Date().toISOString().slice(0, 10);
// Se arranca en 1990 para que el 1 de enero de 1991 ya tenga sus 90 días previos.
const series = await consultarLluviaDiaria(zonas, `${PERIODO.desdeAnio - 1}-01-01`, hoy);

const promedios: PromediosSequia & Record<string, unknown> = {
  generadoEn: new Date().toISOString(),
  fuente: FUENTE,
  precalculado: true,
  periodo: PERIODO,
  diasVentana: dias,
  notas: [
    `Para cada día del año (MM-DD): promedio ${PERIODO.desdeAnio}-${PERIODO.hastaAnio} de la lluvia acumulada en los ${dias} días que terminan en esa fecha.`,
    'Sale de un reanálisis con celdas de unos 9 km, no de pluviómetros: sirve para comparar contra sí mismo, no como registro oficial de lluvia.',
  ],
  zonas: series.map((s) => ({
    zonaId: s.zonaId,
    celda: s.celda,
    promedio90dMm: promediosPorDia(s.fechas, s.lluviaMm, dias, PERIODO.desdeAnio, PERIODO.hastaAnio),
  })),
};

const actual = {
  generadoEn: promedios.generadoEn,
  fuente: FUENTE,
  precalculado: true,
  umbrales: UMBRALES_SEQUIA,
  notas: ['Umbrales iniciales, sin validar científicamente.', 'nivel = null significa "época seca, sin dato".'],
  zonas: series.map((s) => {
    const zona = zonas.find((z) => z.id === s.zonaId)!;
    const normal = promedios.zonas.find((z) => z.zonaId === s.zonaId)!.promedio90dMm;
    const ultimo = s.lluviaMm.findLastIndex((v) => v !== null);
    // Cierres de mes de los últimos 12 meses, para mostrar la tendencia.
    const mensual = s.fechas
      .map((fecha, i) => ({ fecha, i }))
      .filter(({ fecha, i }) => i < ultimo && i > ultimo - 366 && s.fechas[i + 1]!.slice(8) === '01')
      .map(({ fecha, i }) => {
        const r = evaluarSequia(acumulado(s.lluviaMm, i, dias)!, normal[fecha.slice(5)]!, fecha);
        return { fecha, nivel: r.nivel, ...r.variables };
      });
    return { zonaId: zona.id, nombre: zona.nombre, celda: s.celda, ...calcularSequia(s, promedios), mensual };
  }),
};

await mkdir(CARPETA, { recursive: true });
await writeFile(`${CARPETA}promedios.json`, JSON.stringify(promedios, null, 1) + '\n');
await writeFile(`${CARPETA}actual.json`, JSON.stringify(actual, null, 2) + '\n');
for (const z of actual.zonas) {
  console.log(`${z.nombre}: ${z.nivel ?? 'época seca'} — ${z.motivos[0]!.texto}`);
  console.log('  ' + z.mensual.map((m) => `${m.fecha.slice(0, 7)} ${m.nivel ?? 'seca'}`).join(' | '));
}
