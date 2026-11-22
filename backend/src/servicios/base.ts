import pg from 'pg';
import type { Nivel } from '../../../config/riesgo';
import type { Aviso, Lectura, ResultadoSequia, Suscriptor } from '../tipos';

// Persistencia en Postgres (Neon). Se usa solo si existe DATABASE_URL; si no, el almacén guarda en archivos.
// Las tablas se crean solas al arrancar. Cada una guarda lo último de su colección:
//   suscriptores (quién recibe avisos de qué zona), avisos (historial), niveles (último nivel procesado por zona),
//   lecturas (última serie de Open-Meteo por zona) y sequia (último indicador por zona).
// Las zonas no tienen tabla: viven en config/zonas.ts.

const TABLAS = `
create table if not exists suscriptores (chat_id bigint not null, zona_id text not null, creado_en timestamptz not null, primary key (chat_id, zona_id));
create table if not exists avisos (id text primary key, creado_en timestamptz not null, datos jsonb not null);
create table if not exists niveles (zona_id text primary key, nivel text not null);
create table if not exists lecturas (zona_id text primary key, obtenida_en timestamptz not null, datos jsonb not null);
create table if not exists sequia (zona_id text primary key, datos jsonb not null);
`;

export interface Datos {
  lecturas: Lectura[];
  suscriptores: Suscriptor[];
  avisos: Aviso[];
  // Último nivel procesado por zona, para avisar solo cuando sube.
  nivelesPrevios: Record<string, Nivel>;
  // Último indicador de sequía por zona.
  sequia: Record<string, ResultadoSequia>;
}

let pool: pg.Pool | null = null;

export const hayBase = (): boolean => pool !== null;

// Conecta y crea las tablas. Devuelve false si no hay DATABASE_URL o si no se pudo conectar.
export async function conectarBase(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  const nuevo = new pg.Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 15_000 });
  // Neon corta las conexiones inactivas: sin este manejador, ese corte tiraría abajo el proceso.
  nuevo.on('error', (e) => console.error('Conexión inactiva con la base cerrada:', e.message));
  try {
    await nuevo.query(TABLAS);
    pool = nuevo;
    return true;
  } catch (e) {
    console.error('No se pudo conectar a la base de datos, se sigue con archivos locales:', e instanceof Error ? e.message : e);
    await nuevo.end().catch(() => undefined);
    return false;
  }
}

export async function cerrarBase(): Promise<void> {
  await pool?.end();
  pool = null;
}

export async function leerLecturas(): Promise<Lectura[]> {
  const { rows } = await pool!.query<{ datos: Lectura }>('select datos from lecturas order by zona_id');
  return rows.map((r) => r.datos);
}

export async function leerTodo(): Promise<Datos> {
  const p = pool!;
  const suscriptores = await p.query<{ chat_id: string; zona_id: string; creado_en: Date }>('select chat_id, zona_id, creado_en from suscriptores order by creado_en');
  const avisos = await p.query<{ datos: Aviso }>('select datos from avisos order by creado_en');
  const niveles = await p.query<{ zona_id: string; nivel: Nivel }>('select zona_id, nivel from niveles');
  const sequia = await p.query<{ zona_id: string; datos: ResultadoSequia }>('select zona_id, datos from sequia');
  return {
    lecturas: await leerLecturas(),
    suscriptores: suscriptores.rows.map((r) => ({ chatId: Number(r.chat_id), zonaId: r.zona_id, creadoEn: r.creado_en.toISOString() })),
    avisos: avisos.rows.map((r) => r.datos),
    nivelesPrevios: Object.fromEntries(niveles.rows.map((r) => [r.zona_id, r.nivel])),
    sequia: Object.fromEntries(sequia.rows.map((r) => [r.zona_id, r.datos])),
  };
}

// Reemplaza en la base el contenido de una colección por lo que hay en memoria.
// Los avisos no se borran nunca: se insertan o se actualizan.
const GUARDAR: Record<keyof Datos, string[]> = {
  suscriptores: [
    'delete from suscriptores',
    `insert into suscriptores (chat_id, zona_id, creado_en)
     select "chatId", "zonaId", "creadoEn"::timestamptz from jsonb_to_recordset($1::jsonb) as x("chatId" bigint, "zonaId" text, "creadoEn" text)`,
  ],
  avisos: [
    `insert into avisos (id, creado_en, datos)
     select d->>'id', (d->>'creadoEn')::timestamptz, d from jsonb_array_elements($1::jsonb) d
     on conflict (id) do update set datos = excluded.datos`,
  ],
  nivelesPrevios: ['delete from niveles', 'insert into niveles (zona_id, nivel) select key, value from jsonb_each_text($1::jsonb)'],
  lecturas: [
    'delete from lecturas',
    `insert into lecturas (zona_id, obtenida_en, datos) select d->>'zonaId', (d->>'obtenidaEn')::timestamptz, d from jsonb_array_elements($1::jsonb) d`,
  ],
  sequia: ['delete from sequia', 'insert into sequia (zona_id, datos) select key, value from jsonb_each($1::jsonb)'],
};

export async function guardarEnBase<K extends keyof Datos>(clave: K, valor: Datos[K]): Promise<void> {
  const cliente = await pool!.connect();
  try {
    await cliente.query('begin');
    for (const sql of GUARDAR[clave]) await cliente.query(sql, sql.includes('$1') ? [JSON.stringify(valor)] : []);
    await cliente.query('commit');
  } catch (e) {
    await cliente.query('rollback').catch(() => undefined);
    throw e;
  } finally {
    cliente.release();
  }
}
