import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const CARPETA = fileURLToPath(new URL('../../data/replay/', import.meta.url));

// Forma de los JSON de data/replay/ (los genera `pnpm --filter yaku-backend replay <id>`).
interface ArchivoReplay {
  id: string;
  titulo: string;
  fechaEvento: string;
  zonaPrincipal: string;
  descripcion: string;
  fuentes: string[];
  nota: string;
  zonas: { zonaId: string; nombre: string; dias: ({ fecha: string } & Record<string, unknown>)[] }[];
}

// Lo pasa a la forma que usa la pantalla de Replay (frontend/contratos/replay.md): una lista de días, cada uno con sus zonas.
function paraPantalla(a: ArchivoReplay) {
  const fechas = a.zonas[0]?.dias.map((d) => d.fecha) ?? [];
  return {
    id: a.id,
    titulo: a.titulo,
    descripcion: a.descripcion,
    fuente:
      'Open-Meteo histórico (reanálisis y modelos meteorológicos). Precalculado con el motor y los umbrales actuales. ' +
      'No hay pronósticos archivados de esa fecha: la lluvia de las 24 horas siguientes sale del registro histórico y ocupa el lugar del pronóstico.',
    verificado: true,
    diaEvento: a.fechaEvento,
    zonaPrincipal: a.zonaPrincipal,
    fuentes: a.fuentes,
    nota: a.nota,
    dias: fechas.map((fecha) => ({
      fecha,
      zonas: a.zonas.map((z) => ({ zonaId: z.zonaId, nombre: z.nombre, ...z.dias.find((d) => d.fecha === fecha) })),
    })),
  };
}

export async function crearRouterReplay(): Promise<Router> {
  const replays = new Map<string, ReturnType<typeof paraPantalla>>();
  for (const archivo of (await readdir(CARPETA)).filter((n) => n.endsWith('.json'))) {
    const replay = paraPantalla(JSON.parse(await readFile(`${CARPETA}${archivo}`, 'utf8')) as ArchivoReplay);
    replays.set(replay.id, replay);
  }

  const router = Router();
  router.get('/', (_req, res) => {
    res.json({ eventos: [...replays.values()].map(({ id, titulo, diaEvento, verificado, descripcion }) => ({ id, titulo, diaEvento, verificado, descripcion })) });
  });
  router.get('/:id', (req, res) => {
    const replay = replays.get(req.params.id);
    if (!replay) {
      res.status(404).json({ error: `No existe el replay "${req.params.id}"` });
      return;
    }
    res.json(replay);
  });
  return router;
}
