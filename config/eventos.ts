// Eventos reales para el Modo Replay. Agregar uno = agregar una entrada (con fuentes) y correr
// `pnpm --filter yaku-backend replay <id>` para generar data/replay/<id>.json.
// Solo se cargan eventos con fecha confirmada por al menos una fuente citada.

export interface EventoReplay {
  id: string;
  titulo: string;
  // Fecha local del evento, AAAA-MM-DD.
  fechaEvento: string;
  zonaPrincipal: string;
  descripcion: string;
  fuentes: string[];
}

export const EVENTOS: EventoReplay[] = [
  {
    id: 'volcan-2017-01-10',
    titulo: 'Alud de Volcán, 10 de enero de 2017',
    fechaEvento: '2017-01-10',
    zonaPrincipal: 'volcan',
    descripcion:
      'El 10 de enero de 2017 un alud de barro y piedras afectó a Volcán, Tumbaya y Bárcena. Según el informe de la Cruz Roja (IFRC), hubo 2 personas fallecidas, 2.666 afectadas y 446 evacuadas.',
    fuentes: [
      'https://reliefweb.int/report/argentina/argentina-landslide-dref-final-report-mdrar012',
      'https://www.lanacion.com.ar/sociedad/alud-en-jujuy-dos-muertos-en-la-localidad-de-volcan-nid1974677/',
    ],
  },
];
