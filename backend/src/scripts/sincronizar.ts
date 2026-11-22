import '../env';
import { ZONAS } from '../../../config/zonas';
import { almacen, cargarAlmacen, cerrarAlmacen, persistir } from '../servicios/almacen';
import { hayBase } from '../servicios/base';
import { consultarPronostico } from '../servicios/openMeteo';

// Baja las lecturas de Open-Meteo desde esta máquina y las sube a la base de datos.
// Sirve porque Open-Meteo rechaza la IP compartida de Render (error 429): el backend desplegado
// toma estas lecturas de la base en su próxima actualización (cada 3 horas o con POST /api/jobs/run).
// Uso: pnpm --filter yaku-backend sincronizar  (necesita DATABASE_URL en backend/.env)

await cargarAlmacen();
if (!hayBase()) throw new Error('No hay conexión con la base: revisar DATABASE_URL en backend/.env');
almacen.lecturas = await consultarPronostico(ZONAS);
await persistir('lecturas');
console.log(`Lecturas de ${almacen.lecturas.length} zonas subidas a la base (datos de ${almacen.lecturas[0]?.obtenidaEn}).`);
await cerrarAlmacen();
