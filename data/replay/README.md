# data/replay

JSON precalculados del Modo Replay, uno por evento de `config/eventos.ts`. Se regeneran con `pnpm replay` (o `pnpm replay <id>`), que baja el reanálisis histórico de Open-Meteo (ERA5) y corre el mismo motor de aludes del semáforo en vivo cada 3 horas, desde 7 días antes hasta el final del día del evento.

Son datos **precalculados**: decirlo en la pantalla del Replay.

## Eventos

| Archivo | Evento | Qué muestra el motor | Sirve para la demo |
|---|---|---|---|
| `volcan-2017-01-10.json` | Alud de Volcán, Tumbaya y Bárcena, martes 10/01/2017 (el alud llegó a Tumbaya cerca de las 8:30) | Volcán y Tumbaya: verde el 3, amarillo el 4, naranja el 5 y 6, verde el 7, amarillo el 8, rojo desde el 9 a las 12:00 | Sí |
| `huichaira-2025-03-06.json` | Crecida del arroyo Huichaira y Bordo Sococha (Tilcara), jueves 6/03/2025 a la tarde-noche | Nunca pasa de amarillo: el reanálisis da como máximo 17 mm en un día en Tilcara esa semana, y 5 mm el día de la crecida | No. Es un caso que Yaku no ve |

Las fechas y los hechos de cada evento están verificados con las fuentes listadas en `config/eventos.ts` (campo `fuentes`, también incluido en cada JSON).

## Límites que hay que decir

- **No es lo que Yaku habría mostrado ese día.** Es una reconstrucción con reanálisis. En `nivel`, la lluvia de las 24 horas siguientes ya se conoce (hace de pronóstico perfecto). `nivelSoloObservado` usa solo lo que ya había llovido.
- **Volcán 2017:** con pronóstico perfecto el rojo aparece 20 horas antes del alud. Con solo lo observado, el rojo aparece recién el 10 a las 12:00, después del alud: el reanálisis ubica la lluvia más fuerte entre las 10 y las 14 h, y el alud fue cerca de las 8:30. La anticipación real depende de qué tan bueno haya sido el pronóstico de ese día, y eso no lo tenemos. No decir "Yaku lo hubiera avisado 20 horas antes" sin esa aclaración.
- **Huichaira 2025:** una tormenta local de pocas horas no aparece en un reanálisis con celdas de unos 9 km. Es la limitación principal del enfoque y conviene decirla.
- En la celda de Volcán y Tumbaya la humedad del suelo estuvo por encima de 0,38 todo enero de 2017, así que el umbral de suelo (0,30 y 0,35) se cumple siempre: en ese evento el semáforo lo mueve solo la lluvia.
- Volcán y Tumbaya comparten celda, así que sus secuencias son idénticas.
- Umbrales iniciales, sin validar. No se ajustaron con estos eventos.

## Formato

```
{
  evento: { id, titulo, fecha, horaLocal, zonasAfectadas, descripcion, diasPrevios, fuentes[] },
  generadoEn, fuente, precalculado: true, cadaHoras: 3, desde, hasta, umbrales, notas[],
  zonas: [{
    zonaId, nombre, afectada, celda,
    anticipacionRojoHoras, anticipacionRojoSoloObservadoHoras,   // null = no hubo rojo antes del evento, o no se conoce la hora
    dias:  [{ fechaLocal, lluviaMm, nivelMaximo, nivelMaximoSoloObservado }],
    pasos: [{ t, fechaLocal, horaLocal, nivel, nivelSoloObservado, motivos[], variables }]
  }]
}
```

`dias` alcanza para una línea de tiempo simple (un color por día). `pasos` da el detalle cada 3 horas, con los mismos `motivos` y `variables` que `/api/estado`. Horas y fechas locales en hora de Jujuy (UTC-3); `t` en UTC.
