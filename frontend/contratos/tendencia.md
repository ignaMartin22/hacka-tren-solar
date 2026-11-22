# Contrato propuesto: tendencia de 7 días

Para el equipo de backend. El frontend ya tiene el gráfico (`GraficoTendencia`) y llama a este endpoint, pero hoy usa datos de ejemplo porque el backend no lo expone. Cuando exista, se cambia `TENDENCIA_DISPONIBLE` a `true` en `frontend/src/tendencia/api.ts`.

## Endpoint

```
GET /api/estado/:zonaId/tendencia
```

- 200: `TendenciaZona` (abajo).
- 404: la zona no existe (igual que `GET /api/estado/:zonaId`).

## Forma de la respuesta

Tipo en `frontend/src/tendencia/tipos.ts`:

```ts
interface TendenciaZona {
  zonaId: string;
  desde: string;   // ISO 8601 UTC, inicio del primer día (00:00 hora Jujuy)
  hasta: string;   // ISO 8601 UTC, momento del cálculo
  dias: {          // 7 elementos, del más viejo al más nuevo; el último es hoy
    fecha: string;              // "YYYY-MM-DD", hora local de Jujuy (UTC-3)
    lluviaMm: number;           // suma del día, en mm
    sueloMedio: number | null;  // promedio del día, m³/m³; null si no hay datos
    nivel: 'verde' | 'amarillo' | 'naranja' | 'rojo' | null; // al cierre del día; null = sin dato
  }[];
}
```

Ejemplo (formato real, valores inventados):

```json
{
  "zonaId": "tilcara",
  "desde": "2026-11-16T03:00:00.000Z",
  "hasta": "2026-11-22T14:21:38.648Z",
  "dias": [
    { "fecha": "2026-11-16", "lluviaMm": 0,    "sueloMedio": 0.18, "nivel": "verde" },
    { "fecha": "2026-11-17", "lluviaMm": 2.4,  "sueloMedio": 0.21, "nivel": "verde" },
    { "fecha": "2026-11-18", "lluviaMm": 0.6,  "sueloMedio": 0.22, "nivel": "verde" },
    { "fecha": "2026-11-19", "lluviaMm": 11.8, "sueloMedio": 0.31, "nivel": "amarillo" },
    { "fecha": "2026-11-20", "lluviaMm": 6.2,  "sueloMedio": 0.36, "nivel": "naranja" },
    { "fecha": "2026-11-21", "lluviaMm": 1.1,  "sueloMedio": 0.33, "nivel": "amarillo" },
    { "fecha": "2026-11-22", "lluviaMm": 0,    "sueloMedio": null, "nivel": null }
  ]
}
```

## Cómo calcularlo desde la serie horaria

Se parte de la serie horaria de lluvia y humedad del suelo que ya se guarda (7 días pasados). Los timestamps vienen en UTC.

1. **Día local**: convertir cada hora a hora de Jujuy (UTC-3, sin horario de verano) y agrupar por fecha local `YYYY-MM-DD`. El día 00:00 a 23:59 local equivale a 03:00Z a 02:59Z del día siguiente.
2. **`lluviaMm`**: suma de las lluvias horarias del día local. Ignorar horas `null`; si no hay ninguna hora con dato, devolver `0` (el gráfico no distingue "sin dato" de "no llovió", eso lo cuenta `nivel: null`).
3. **`sueloMedio`**: promedio de las horas del día con dato (m³/m³). Si no hay ninguna hora con dato, `null`.
4. **`nivel`**: el que da el motor de aludes con los datos disponibles **al cierre del día** (23:00 local). Para el día de hoy, el nivel actual. Si no se puede calcular (por ejemplo, zonas sin dato), `null`.
5. **`dias`**: siempre 7 elementos consecutivos terminando en hoy (hora local). Un día sin datos va con `lluviaMm: 0`, `sueloMedio: null` y `nivel: null`, no se omite.
6. **`desde` / `hasta`**: `desde` es el inicio del primer día (03:00Z); `hasta` es el momento del cálculo.

## Notas

- El frontend no recalcula nada: muestra lo que llega.
- Este endpoint es una propuesta y no existe todavía; si cambia la forma, avisar al frontend.
