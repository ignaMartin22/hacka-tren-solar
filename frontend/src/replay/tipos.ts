// Tipos del Modo Replay (CONTEXT.md, sección 7).
// Contrato PROPUESTO con el backend: ver frontend/contratos/replay.md.
import type { Motivo, VariablesAludes } from '../../../backend/src/tipos';
import type { Nivel } from '../../../config/riesgo';

export interface ZonaDiaReplay {
  zonaId: string;
  nombre: string;
  // null = ese día todavía no había nivel calculado para la zona.
  nivel: Nivel | null;
  motivos: Motivo[];
  variables: VariablesAludes | null;
}

export interface DiaReplay {
  // YYYY-MM-DD
  fecha: string;
  zonas: ZonaDiaReplay[];
}

export interface EventoReplay {
  id: string;
  titulo: string;
  descripcion: string;
  // De dónde salieron los datos (por ejemplo "Open-Meteo histórico (ERA5)"). null si no se cargó.
  fuente: string | null;
  // false mientras el evento no esté verificado contra una fuente real (CONTEXT.md, sección 7).
  verificado: boolean;
  // YYYY-MM-DD del día del evento; tiene que coincidir con la `fecha` de algún día de `dias`.
  diaEvento: string;
  // Días en orden, de más viejo a más nuevo; el día del evento suele ser el último.
  dias: DiaReplay[];
}

export interface IndiceReplay {
  eventos: {
    id: string;
    titulo: string;
    diaEvento: string;
    verificado: boolean;
  }[];
}
