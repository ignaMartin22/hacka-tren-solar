import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const CARPETA = fileURLToPath(new URL('../../data/replay/', import.meta.url));

interface Replay {
  id: string;
  titulo: string;
  fechaEvento: string;
  zonaPrincipal: string;
  descripcion: string;
}

// Sirve los JSON precalculados de data/replay/ (los genera `pnpm --filter yaku-backend replay <id>`).
export async function crearRouterReplay(): Promise<Router> {
  const replays = new Map<string, Replay>();
  for (const archivo of (await readdir(CARPETA)).filter((a) => a.endsWith('.json'))) {
    const replay = JSON.parse(await readFile(`${CARPETA}${archivo}`, 'utf8')) as Replay;
    replays.set(replay.id, replay);
  }

  const router = Router();
  router.get('/', (_req, res) => {
    res.json([...replays.values()].map(({ id, titulo, fechaEvento, zonaPrincipal, descripcion }) => ({ id, titulo, fechaEvento, zonaPrincipal, descripcion })));
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
