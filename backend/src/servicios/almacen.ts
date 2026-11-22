import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Nivel } from '../../../config/riesgo';
import type { Aviso, Lectura, ResultadoSequia, Suscriptor } from '../tipos';

// Almacén provisorio: memoria + un JSON por colección en backend/.datos/ (fuera del repo).
// Pendiente: reemplazar por Postgres (Neon) con Prisma. En Render el disco se borra en cada reinicio.
// DATOS_DIR permite apuntar a otra carpeta (los tests usan una temporal). Debe terminar en barra.
const CARPETA = process.env.DATOS_DIR ?? fileURLToPath(new URL('../../.datos/', import.meta.url));

interface Datos {
  lecturas: Lectura[];
  suscriptores: Suscriptor[];
  avisos: Aviso[];
  // Último nivel procesado por zona, para avisar solo cuando sube.
  nivelesPrevios: Record<string, Nivel>;
  // Último indicador de sequía por zona.
  sequia: Record<string, ResultadoSequia>;
}

export const almacen: Datos = { lecturas: [], suscriptores: [], avisos: [], nivelesPrevios: {}, sequia: {} };

// Guarda en disco la colección indicada tal como está en memoria.
export async function persistir(clave: keyof Datos): Promise<void> {
  await mkdir(CARPETA, { recursive: true });
  await writeFile(`${CARPETA}${clave}.json`, JSON.stringify(almacen[clave]));
}

// Recupera de disco lo que haya guardado de una corrida anterior.
export async function cargarAlmacen(): Promise<void> {
  for (const clave of Object.keys(almacen) as (keyof Datos)[]) {
    try {
      (almacen as unknown as Record<string, unknown>)[clave] = JSON.parse(await readFile(`${CARPETA}${clave}.json`, 'utf8'));
    } catch {
      // Sin archivo previo: la colección queda vacía.
    }
  }
}
