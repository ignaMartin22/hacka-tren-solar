// Contrato PROPUESTO de la tendencia de 7 días. Ver frontend/contratos/tendencia.md.
import type { Nivel } from '../../../config/riesgo';

export interface DiaTendencia {
  // YYYY-MM-DD en hora local de Jujuy (UTC-3).
  fecha: string;
  // Lluvia acumulada del día, en mm.
  lluviaMm: number;
  // Humedad del suelo promedio del día, en m³/m³. null si no hay datos.
  sueloMedio: number | null;
  // Nivel de riesgo al cierre del día. null = sin dato.
  nivel: Nivel | null;
}

export interface TendenciaZona {
  zonaId: string;
  // ISO 8601 UTC: inicio y fin del período cubierto.
  desde: string;
  hasta: string;
  // Del más viejo al más nuevo (7 elementos).
  dias: DiaTendencia[];
}
