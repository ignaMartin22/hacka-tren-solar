import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ZONAS } from '../../../config/zonas';
import { consultarPronostico } from '../servicios/openMeteo';

// Baja las lecturas de Open-Meteo y las guarda en data/respaldo/lecturas.json.
// El backend desplegado las usa cuando no puede consultar Open-Meteo (en Render la IP compartida suele tener el cupo diario agotado).
// Uso, desde una máquina que sí llegue a Open-Meteo: pnpm --filter yaku-backend respaldo, y después commit, push y redeploy.

const lecturas = await consultarPronostico(ZONAS);
const carpeta = fileURLToPath(new URL('../../../data/respaldo/', import.meta.url));
await mkdir(carpeta, { recursive: true });
await writeFile(`${carpeta}lecturas.json`, `${JSON.stringify(lecturas)}\n`);
console.log(`Respaldo guardado: ${lecturas.length} zonas, datos de ${lecturas[0]?.obtenidaEn}`);
