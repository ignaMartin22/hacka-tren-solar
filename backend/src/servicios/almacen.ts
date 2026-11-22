import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Lectura } from '../tipos';

// Almacén provisorio: memoria + un JSON en backend/.datos/ (fuera del repo).
// Sirve para no depender de Open-Meteo en la demo. Pendiente: reemplazar por Postgres (Neon) con Prisma.
const CARPETA = fileURLToPath(new URL('../../.datos/', import.meta.url));
const ARCHIVO = `${CARPETA}lecturas.json`;

let lecturas: Lectura[] = [];

export const obtenerLecturas = (): Lectura[] => lecturas;

export async function guardarLecturas(nuevas: Lectura[]): Promise<void> {
  lecturas = nuevas;
  await mkdir(CARPETA, { recursive: true });
  await writeFile(ARCHIVO, JSON.stringify(nuevas));
}

// Recupera las últimas lecturas guardadas en disco. Devuelve false si no hay ninguna.
export async function cargarLecturasGuardadas(): Promise<boolean> {
  try {
    lecturas = JSON.parse(await readFile(ARCHIVO, 'utf8')) as Lectura[];
    return lecturas.length > 0;
  } catch {
    return false;
  }
}
