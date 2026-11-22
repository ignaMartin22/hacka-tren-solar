import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Lectura } from '../tipos';
import { cerrarBase, conectarBase, guardarEnBase, hayBase, leerLecturas, leerTodo, type Datos } from './base';

// Almacén: todo vive en memoria y cada cambio se guarda.
// - Con DATABASE_URL: en Postgres (Neon). Ver base.ts.
// - Sin DATABASE_URL (desarrollo y tests): un JSON por colección en backend/.datos/, fuera del repo.
// DATOS_DIR permite apuntar a otra carpeta (los tests usan una temporal). Debe terminar en barra.
const CARPETA = process.env.DATOS_DIR ?? fileURLToPath(new URL('../../.datos/', import.meta.url));

export const almacen: Datos = { lecturas: [], suscriptores: [], avisos: [], nivelesPrevios: {}, sequia: {} };

// Guarda la colección indicada tal como está en memoria.
// Si la base falla, el dato sigue en memoria y el error queda en el log: no se corta el pedido que lo originó.
export async function persistir(clave: keyof Datos): Promise<void> {
  if (hayBase()) {
    await guardarEnBase(clave, almacen[clave]).catch((e: Error) => console.error(`No se pudo guardar "${clave}" en la base:`, e.message));
    return;
  }
  await mkdir(CARPETA, { recursive: true });
  await writeFile(`${CARPETA}${clave}.json`, JSON.stringify(almacen[clave]));
}

// Recupera lo guardado de una corrida anterior. Devuelve de dónde lo leyó.
export async function cargarAlmacen(): Promise<'base de datos' | 'archivos locales'> {
  if (await conectarBase()) {
    Object.assign(almacen, await leerTodo());
    return 'base de datos';
  }
  for (const clave of Object.keys(almacen) as (keyof Datos)[]) {
    try {
      (almacen as unknown as Record<string, unknown>)[clave] = JSON.parse(await readFile(`${CARPETA}${clave}.json`, 'utf8'));
    } catch {
      // Sin archivo previo: la colección queda vacía.
    }
  }
  return 'archivos locales';
}

export const cerrarAlmacen = cerrarBase;

const masNuevas = (lecturas: Lectura[]): string | null => {
  const fecha = lecturas[0]?.obtenidaEn;
  if (!fecha || fecha <= (almacen.lecturas[0]?.obtenidaEn ?? '')) return null;
  almacen.lecturas = lecturas;
  return fecha;
};

// Si las lecturas del repo (data/respaldo/lecturas.json) son más nuevas que las guardadas, las usa.
// Devuelve la fecha del respaldo si lo cargó.
export async function cargarRespaldo(): Promise<string | null> {
  try {
    return masNuevas(JSON.parse(await readFile(new URL('../../../data/respaldo/lecturas.json', import.meta.url), 'utf8')) as Lectura[]);
  } catch {
    return null;
  }
}

// Vuelve a leer las lecturas de la base, por si otra máquina subió unas más nuevas (pnpm --filter yaku-backend sincronizar).
// Devuelve su fecha si las cargó.
export async function recargarLecturasDeLaBase(): Promise<string | null> {
  if (!hayBase()) return null;
  try {
    return masNuevas(await leerLecturas());
  } catch (e) {
    console.error('No se pudieron leer las lecturas de la base:', e instanceof Error ? e.message : e);
    return null;
  }
}
