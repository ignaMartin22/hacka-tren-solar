// DATOS DE EJEMPLO, NO REALES.
// Las fechas (año 2099), las lluvias y la humedad del suelo están inventadas para probar
// la pantalla del Modo Replay: NO corresponden a ningún evento real de la Quebrada.
// Los niveles y motivos ya vienen calculados (se generaron una vez con el motor del
// backend, backend/src/riesgo/aludes.ts) para no meter código de backend en el bundle.
// La interfaz lo marca con el texto "Datos de ejemplo".
import type { EventoReplay, IndiceReplay } from '../replay/tipos';

export const EVENTO_REPLAY_EJEMPLO: EventoReplay = {
  "id": "evento-de-ejemplo",
  "titulo": "Evento de ejemplo",
  "descripcion": "Secuencia inventada para mostrar cómo el semáforo sube día a día antes de una lluvia fuerte. No es un evento real.",
  "fuente": null,
  "verificado": false,
  "diaEvento": "2099-01-10",
  "dias": [
    {
      "fecha": "2099-01-03",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 4 mm en 24 horas y humedad del suelo de 0,22."
            }
          ],
          "variables": {
            "lluvia24hMm": 4,
            "lluvia72hMm": 6,
            "pronostico24hMm": 2,
            "suelo": 0.22,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 5 mm en 24 horas y humedad del suelo de 0,23."
            }
          ],
          "variables": {
            "lluvia24hMm": 5,
            "lluvia72hMm": 7,
            "pronostico24hMm": 2,
            "suelo": 0.23,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 3 mm en 24 horas y humedad del suelo de 0,21."
            }
          ],
          "variables": {
            "lluvia24hMm": 3,
            "lluvia72hMm": 5,
            "pronostico24hMm": 1,
            "suelo": 0.21,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 2 mm en 24 horas y humedad del suelo de 0,20."
            }
          ],
          "variables": {
            "lluvia24hMm": 2,
            "lluvia72hMm": 4,
            "pronostico24hMm": 1,
            "suelo": 0.2,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 2 mm en 24 horas y humedad del suelo de 0,20."
            }
          ],
          "variables": {
            "lluvia24hMm": 2,
            "lluvia72hMm": 3,
            "pronostico24hMm": 1,
            "suelo": 0.2,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 1 mm en 24 horas y humedad del suelo de 0,19."
            }
          ],
          "variables": {
            "lluvia24hMm": 1,
            "lluvia72hMm": 2,
            "pronostico24hMm": 0,
            "suelo": 0.19,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-04",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 9 mm en 24 horas y humedad del suelo de 0,27."
            }
          ],
          "variables": {
            "lluvia24hMm": 9,
            "lluvia72hMm": 11,
            "pronostico24hMm": 4,
            "suelo": 0.27,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 10 mm en 24 horas y humedad del suelo de 0,28."
            }
          ],
          "variables": {
            "lluvia24hMm": 10,
            "lluvia72hMm": 12,
            "pronostico24hMm": 4,
            "suelo": 0.28,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 8 mm en 24 horas y humedad del suelo de 0,26."
            }
          ],
          "variables": {
            "lluvia24hMm": 8,
            "lluvia72hMm": 10,
            "pronostico24hMm": 3,
            "suelo": 0.26,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 6 mm en 24 horas y humedad del suelo de 0,24."
            }
          ],
          "variables": {
            "lluvia24hMm": 6,
            "lluvia72hMm": 8,
            "pronostico24hMm": 2,
            "suelo": 0.24,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 5 mm en 24 horas y humedad del suelo de 0,24."
            }
          ],
          "variables": {
            "lluvia24hMm": 5,
            "lluvia72hMm": 7,
            "pronostico24hMm": 2,
            "suelo": 0.24,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 4 mm en 24 horas y humedad del suelo de 0,22."
            }
          ],
          "variables": {
            "lluvia24hMm": 4,
            "lluvia72hMm": 5,
            "pronostico24hMm": 2,
            "suelo": 0.22,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-05",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 17 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,30 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 6 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 17,
            "lluvia72hMm": 22,
            "pronostico24hMm": 6,
            "suelo": 0.3,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 18 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,31 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 6 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 18,
            "lluvia72hMm": 24,
            "pronostico24hMm": 6,
            "suelo": 0.31,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 15 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 15,
            "lluvia72hMm": 19,
            "pronostico24hMm": 5,
            "suelo": 0.29,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 11 mm en 24 horas y humedad del suelo de 0,27."
            }
          ],
          "variables": {
            "lluvia24hMm": 11,
            "lluvia72hMm": 14,
            "pronostico24hMm": 4,
            "suelo": 0.27,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 10 mm en 24 horas y humedad del suelo de 0,27."
            }
          ],
          "variables": {
            "lluvia24hMm": 10,
            "lluvia72hMm": 13,
            "pronostico24hMm": 4,
            "suelo": 0.27,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 7 mm en 24 horas y humedad del suelo de 0,24."
            }
          ],
          "variables": {
            "lluvia24hMm": 7,
            "lluvia72hMm": 9,
            "pronostico24hMm": 3,
            "suelo": 0.24,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-06",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 22 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,33 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 10 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 22,
            "lluvia72hMm": 40,
            "pronostico24hMm": 10,
            "suelo": 0.33,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 23 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,34 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 9 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 23,
            "lluvia72hMm": 42,
            "pronostico24hMm": 9,
            "suelo": 0.34,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 20 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,32 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 8 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 20,
            "lluvia72hMm": 36,
            "pronostico24hMm": 8,
            "suelo": 0.32,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 16 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,30 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 6 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 16,
            "lluvia72hMm": 28,
            "pronostico24hMm": 6,
            "suelo": 0.3,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 15 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,30 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 6 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 15,
            "lluvia72hMm": 26,
            "pronostico24hMm": 6,
            "suelo": 0.3,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 11 mm en 24 horas y humedad del suelo de 0,27."
            }
          ],
          "variables": {
            "lluvia24hMm": 11,
            "lluvia72hMm": 19,
            "pronostico24hMm": 4,
            "suelo": 0.27,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-07",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 29 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,36 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 29,
            "lluvia72hMm": 60,
            "pronostico24hMm": 12,
            "suelo": 0.36,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 27 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,35 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 27,
            "lluvia72hMm": 58,
            "pronostico24hMm": 11,
            "suelo": 0.35,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 24 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,34 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 9 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 24,
            "lluvia72hMm": 50,
            "pronostico24hMm": 9,
            "suelo": 0.34,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 19 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,33 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 7 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 19,
            "lluvia72hMm": 40,
            "pronostico24hMm": 7,
            "suelo": 0.33,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 17 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,32 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 6 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 17,
            "lluvia72hMm": 37,
            "pronostico24hMm": 6,
            "suelo": 0.32,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "verde",
          "motivos": [
            {
              "codigo": "sin_alerta",
              "texto": "Sin lluvias fuertes ni suelo saturado: hasta 14 mm en 24 horas y humedad del suelo de 0,29."
            }
          ],
          "variables": {
            "lluvia24hMm": 14,
            "lluvia72hMm": 26,
            "pronostico24hMm": 5,
            "suelo": 0.29,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-08",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 38 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,38 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 38,
            "lluvia72hMm": 78,
            "pronostico24hMm": 15,
            "suelo": 0.38,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 36 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,37 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 36,
            "lluvia72hMm": 74,
            "pronostico24hMm": 14,
            "suelo": 0.37,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 28 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,36 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 28,
            "lluvia72hMm": 64,
            "pronostico24hMm": 11,
            "suelo": 0.36,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 26 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,34 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es media."
            }
          ],
          "variables": {
            "lluvia24hMm": 26,
            "lluvia72hMm": 58,
            "pronostico24hMm": 10,
            "suelo": 0.34,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 22 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,33 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 8 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 22,
            "lluvia72hMm": 50,
            "pronostico24hMm": 8,
            "suelo": 0.33,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 17 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,30 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 6 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 17,
            "lluvia72hMm": 34,
            "pronostico24hMm": 6,
            "suelo": 0.3,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-09",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "rojo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 47 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 45 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo ya está saturado: 0,39 m³ de agua por m³ de suelo (umbral: 0,35)."
            },
            {
              "codigo": "lluvia_72h",
              "texto": "Llovieron 96 mm en los últimos 3 días (umbral: 90 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 47,
            "lluvia72hMm": 96,
            "pronostico24hMm": 18,
            "suelo": 0.39,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 41 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,38 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 41,
            "lluvia72hMm": 88,
            "pronostico24hMm": 16,
            "suelo": 0.38,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 35 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,37 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es alta."
            }
          ],
          "variables": {
            "lluvia24hMm": 35,
            "lluvia72hMm": 80,
            "pronostico24hMm": 13,
            "suelo": 0.37,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 30 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,35 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es media."
            }
          ],
          "variables": {
            "lluvia24hMm": 30,
            "lluvia72hMm": 68,
            "pronostico24hMm": 11,
            "suelo": 0.35,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 26 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,34 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es media."
            }
          ],
          "variables": {
            "lluvia24hMm": 26,
            "lluvia72hMm": 60,
            "pronostico24hMm": 10,
            "suelo": 0.34,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 20 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,31 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 7 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 20,
            "lluvia72hMm": 44,
            "pronostico24hMm": 7,
            "suelo": 0.31,
            "pendiente": "media"
          }
        }
      ]
    },
    {
      "fecha": "2099-01-10",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "rojo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 62 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 45 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo ya está saturado: 0,42 m³ de agua por m³ de suelo (umbral: 0,35)."
            },
            {
              "codigo": "lluvia_72h",
              "texto": "Llovieron 128 mm en los últimos 3 días (umbral: 90 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 62,
            "lluvia72hMm": 128,
            "pronostico24hMm": 20,
            "suelo": 0.42,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "tumbaya",
          "nombre": "Tumbaya",
          "nivel": "rojo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 55 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 45 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo ya está saturado: 0,41 m³ de agua por m³ de suelo (umbral: 0,35)."
            },
            {
              "codigo": "lluvia_72h",
              "texto": "Llovieron 118 mm en los últimos 3 días (umbral: 90 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 55,
            "lluvia72hMm": 118,
            "pronostico24hMm": 18,
            "suelo": 0.41,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "purmamarca",
          "nombre": "Purmamarca",
          "nivel": "rojo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 48 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 45 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo ya está saturado: 0,40 m³ de agua por m³ de suelo (umbral: 0,35)."
            },
            {
              "codigo": "lluvia_72h",
              "texto": "Llovieron 105 mm en los últimos 3 días (umbral: 90 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 48,
            "lluvia72hMm": 105,
            "pronostico24hMm": 16,
            "suelo": 0.4,
            "pendiente": "alta"
          }
        },
        {
          "zonaId": "maimara",
          "nombre": "Maimará",
          "nivel": "rojo",
          "motivos": [
            {
              "codigo": "lluvia_72h",
              "texto": "Llovieron 92 mm en los últimos 3 días (umbral: 90 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 38,
            "lluvia72hMm": 92,
            "pronostico24hMm": 13,
            "suelo": 0.38,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "tilcara",
          "nombre": "Tilcara",
          "nivel": "naranja",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 32 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 25 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,36 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pendiente",
              "texto": "La pendiente de la cuenca es media."
            }
          ],
          "variables": {
            "lluvia24hMm": 32,
            "lluvia72hMm": 84,
            "pronostico24hMm": 11,
            "suelo": 0.36,
            "pendiente": "media"
          }
        },
        {
          "zonaId": "humahuaca",
          "nombre": "Humahuaca",
          "nivel": "amarillo",
          "motivos": [
            {
              "codigo": "lluvia_24h",
              "texto": "Hasta 24 mm de lluvia en 24 horas, entre lo que ya llovió y lo que se espera (umbral: 15 mm)."
            },
            {
              "codigo": "suelo",
              "texto": "El suelo está muy húmedo: 0,33 m³ de agua por m³ de suelo (umbral: 0,30)."
            },
            {
              "codigo": "pronostico_24h",
              "texto": "Se esperan 8 mm de lluvia en las próximas 24 horas (umbral: 5 mm)."
            }
          ],
          "variables": {
            "lluvia24hMm": 24,
            "lluvia72hMm": 56,
            "pronostico24hMm": 8,
            "suelo": 0.33,
            "pendiente": "media"
          }
        }
      ]
    }
  ]
}


export const INDICE_REPLAY_EJEMPLO: IndiceReplay = {
  eventos: [
    {
      id: EVENTO_REPLAY_EJEMPLO.id,
      titulo: EVENTO_REPLAY_EJEMPLO.titulo,
      diaEvento: EVENTO_REPLAY_EJEMPLO.diaEvento,
      verificado: EVENTO_REPLAY_EJEMPLO.verificado,
    },
  ],
};
