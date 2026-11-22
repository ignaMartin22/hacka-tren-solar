// Eventos reales pasados que usa el Modo Replay. Agregar un evento = agregar una entrada acá
// y correr `pnpm replay` para generar su JSON en data/replay/.
//
// Fechas y hechos verificados el 22/11/2026 contra las fuentes de cada entrada.
// No cargar cifras (daños, evacuados, milímetros medidos) que no estén en esas fuentes.

export interface Fuente {
  medio: string;
  titulo: string;
  url: string;
  fecha: string;
}

export interface EventoReplay {
  id: string;
  titulo: string;
  // Día del evento, en hora local de Jujuy (UTC-3), formato AAAA-MM-DD.
  fecha: string;
  // Hora local aproximada (0 a 23), si alguna fuente la da; si no, null.
  horaLocal: number | null;
  // Zonas de config/zonas.ts donde las fuentes ubican el daño.
  zonasAfectadas: string[];
  descripcion: string;
  diasPrevios: number;
  fuentes: Fuente[];
}

export const EVENTOS: EventoReplay[] = [
  {
    id: 'volcan-2017-01-10',
    titulo: 'Alud de Volcán, Tumbaya y Bárcena',
    fecha: '2017-01-10',
    horaLocal: 8,
    zonasAfectadas: ['volcan', 'tumbaya'],
    descripcion:
      'El martes 10 de enero de 2017 un alud de agua, barro y piedras bajó sobre Tumbaya, Volcán y Bárcena y cortó la Ruta Nacional 9. El alud llegó al primer barrio de Tumbaya alrededor de las 8:30. Murieron dos personas en la Cuesta de Bárcena y Volcán fue declarada zona de desastre.',
    diasPrevios: 7,
    fuentes: [
      {
        medio: 'Gobierno de Jujuy (prensa)',
        titulo: 'Informe del Comité Operativo de Emergencias',
        url: 'https://prensa.jujuy.gob.ar/alud/informe-del-comite-operativo-emergencias-n10994',
        fecha: '2017-01-15',
      },
      {
        medio: 'El Tribuno de Jujuy',
        titulo: 'Temporal causó un alud de barro que dejó evacuados y cortes de energía eléctrica',
        url: 'https://eltribunodejujuy.com/nota/2017-1-10-12-19-0-temporal-causo-un-alud-de-barro-que-dejo-evacuados-y-cortes-de-energia-electrica-alud-de-barro',
        fecha: '2017-01-10',
      },
      {
        medio: 'Cruz Roja (IFRC), en ReliefWeb',
        titulo: 'Argentina: Landslide - DREF Final Report (MDRAR012)',
        url: 'https://reliefweb.int/report/argentina/argentina-landslide-dref-final-report-mdrar012',
        fecha: '2017-09-21',
      },
    ],
  },
  {
    id: 'huichaira-2025-03-06',
    titulo: 'Crecida del arroyo Huichaira y Bordo Sococha (Tilcara)',
    fecha: '2025-03-06',
    horaLocal: null,
    zonasAfectadas: ['tilcara', 'maimara'],
    descripcion:
      'En la tarde-noche del jueves 6 de marzo de 2025 una tormenta entre Huacalera y Maimará hizo crecer el arroyo Huichaira y cortó la Ruta Nacional 9 en Huichaira (km 1.772) y Bordo Sococha (km 1.776). Las lluvias siguieron el viernes y el sábado y afectaron también El Perchel.',
    diasPrevios: 7,
    fuentes: [
      {
        medio: 'Vialidad Nacional (argentina.gob.ar)',
        titulo: 'En Jujuy, Vialidad Nacional realizó trabajos de emergencia para habilitar la Ruta Nacional 9',
        url: 'https://www.argentina.gob.ar/noticias/en-jujuy-vialidad-nacional-realizo-trabajos-de-emergencia-para-habilitar-la-ruta-nacional-9',
        fecha: '2025-03-07',
      },
      {
        medio: 'El Tribuno de Jujuy',
        titulo: 'Tormenta en la Quebrada: cortes en la RN 9 y anegamientos en varias localidades',
        url: 'https://eltribunodejujuy.com/municipios/2025-3-6-22-7-0-tormenta-en-la-quebrada-cortes-en-la-rn-9-y-anegamientos-en-varias-localidades',
        fecha: '2025-03-06',
      },
      {
        medio: 'Jujuy al Momento',
        titulo: 'Huacalera y El Perchel, tapadas por agua, barro y piedras',
        url: 'https://www.jujuyalmomento.com/huacalera/huacalera-y-el-perchel-tapadas-agua-barro-y-piedras-n185144',
        fecha: '2025-03-10',
      },
    ],
  },
];
