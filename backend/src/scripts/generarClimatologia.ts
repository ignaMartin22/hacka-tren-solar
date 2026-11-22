import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ZONAS } from '../../../config/zonas';
import { consultarLluviaDiaria } from '../servicios/openMeteo';

// Genera data/sequia/climatologia.json: promedio 1991-2020 de la lluvia de cada día del año, por zona de sequía.
// Se corre una sola vez (o al agregar una zona): pnpm --filter yaku-backend climatologia

const DESDE = '1991-01-01';
const HASTA = '2020-12-31';
const zonas = ZONAS.filter((z) => z.amenaza === 'sequia');
const series = await consultarLluviaDiaria(zonas, DESDE, HASTA);

const climatologia = {
  periodo: `${DESDE} a ${HASTA}`,
  fuenteDatos: 'Open-Meteo Historical Weather API, reanálisis ERA5',
  generadoEn: new Date().toISOString(),
  zonas: Object.fromEntries(
    series.map((serie) => {
      const suma: Record<string, number> = {};
      const cuenta: Record<string, number> = {};
      serie.fechas.forEach((fecha, i) => {
        const valor = serie.lluviaMm[i];
        if (valor === null || valor === undefined) return;
        const dia = fecha.slice(5);
        suma[dia] = (suma[dia] ?? 0) + valor;
        cuenta[dia] = (cuenta[dia] ?? 0) + 1;
      });
      const promedioDiarioMm = Object.fromEntries(Object.keys(suma).sort().map((dia) => [dia, Number((suma[dia]! / cuenta[dia]!).toFixed(3))]));
      const anualMm = Object.values(promedioDiarioMm).reduce((a, b) => a + b, 0);
      console.log(serie.zonaId, `${serie.fechas.length} días, promedio anual ${anualMm.toFixed(0)} mm`);
      return [serie.zonaId, { promedioDiarioMm }];
    }),
  ),
};

const carpeta = fileURLToPath(new URL('../../../data/sequia/', import.meta.url));
await mkdir(carpeta, { recursive: true });
await writeFile(`${carpeta}climatologia.json`, `${JSON.stringify(climatologia)}\n`);
