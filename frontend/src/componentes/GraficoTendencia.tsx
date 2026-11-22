import { estiloNivel } from '../niveles';
import type { TendenciaZona } from '../tendencia/tipos';

const W = 320;
const H = 232;
const IZQ = 40;
const DER = 8;
const TOP = 28;
const BASE_Y = 140; // línea del 0 mm
const ALTO = BASE_Y - TOP;
const DIAS_SEM = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const ABREV: Record<string, string> = { verde: 'VER', amarillo: 'AMA', naranja: 'NAR', rojo: 'ROJ' };

function etiquetaDia(fecha: string) {
  const [a = 0, m = 1, d = 0] = fecha.split('-').map(Number);
  return `${DIAS_SEM[new Date(a, m - 1, d).getDay()] ?? ''} ${d}`;
}
const mm = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 });

// Tope "lindo" del eje: 5, 10, 15, 20, 30, 40...
function topeEje(max: number) {
  if (max <= 5) return 5;
  if (max <= 20) return Math.ceil(max / 5) * 5;
  return Math.ceil(max / 10) * 10;
}

export default function GraficoTendencia({
  tendencia,
  deEjemplo,
}: {
  tendencia: TendenciaZona;
  deEjemplo?: boolean;
}) {
  const dias = tendencia.dias;
  const n = Math.max(dias.length, 1);
  const col = (W - IZQ - DER) / n;
  const maxLluvia = Math.max(0, ...dias.map((d) => d.lluviaMm));
  const tope = topeEje(maxLluvia);
  const yLluvia = (v: number) => BASE_Y - (v / tope) * ALTO;

  const suelos = dias.map((d) => d.sueloMedio);
  const hayAlgunSuelo = suelos.some((s) => s !== null);
  const topeSuelo = Math.max(0.5, ...suelos.filter((s): s is number => s !== null));
  const ySuelo = (v: number) => BASE_Y - (v / topeSuelo) * ALTO;
  const cx = (i: number) => IZQ + col * i + col / 2;

  // Tramos continuos de la línea (los días sin dato cortan la línea).
  const tramos: string[] = [];
  let actual: string[] = [];
  suelos.forEach((s, i) => {
    if (s === null) {
      if (actual.length) tramos.push(actual.join(' '));
      actual = [];
    } else {
      actual.push(`${actual.length ? 'L' : 'M'}${cx(i).toFixed(1)} ${ySuelo(s).toFixed(1)}`);
    }
  });
  if (actual.length) tramos.push(actual.join(' '));

  const diaMax = maxLluvia > 0 ? dias.find((d) => d.lluviaMm === maxLluvia) : undefined;
  const resumen =
    (diaMax
      ? `Lluvia máxima: ${mm(maxLluvia)} mm el ${etiquetaDia(diaMax.fecha)}.`
      : 'No llovió en los últimos 7 días.') + (hayAlgunSuelo ? '' : ' Sin datos de humedad del suelo.');
  const detalle = dias
    .map((d) => `${etiquetaDia(d.fecha)}: ${mm(d.lluviaMm)} mm, nivel ${estiloNivel(d.nivel).etiqueta}`)
    .join('. ');

  return (
    <figure className="m-0 rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-terracota">Últimos 7 días</h3>
        {deEjemplo && (
          <span className="rounded-full bg-chip px-3 py-1 text-sm font-bold text-fg">Datos de ejemplo</span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${resumen} ${detalle}.`} className="mt-2 block h-auto w-full">
        {/* Eje de lluvia */}
        <line x1={IZQ} x2={W - DER} y1={TOP} y2={TOP} stroke="var(--color-line)" strokeDasharray="3 3" />
        <line x1={IZQ} x2={W - DER} y1={BASE_Y} y2={BASE_Y} stroke="var(--color-muted)" strokeWidth="1" />
        <text x={IZQ - 4} y={TOP + 4} textAnchor="end" fontSize="12" fill="var(--color-muted)">
          {tope} mm
        </text>
        <text x={IZQ - 4} y={BASE_Y + 4} textAnchor="end" fontSize="12" fill="var(--color-muted)">
          0
        </text>

        {dias.map((d, i) => {
          const h = (d.lluviaMm / tope) * ALTO;
          const ancho = Math.min(col - 8, 26);
          const est = estiloNivel(d.nivel);
          const abrev = d.nivel ? ABREV[d.nivel] : 'S/D';
          return (
            <g key={d.fecha}>
              {d.lluviaMm > 0 && (
                <>
                  <rect x={cx(i) - ancho / 2} y={yLluvia(d.lluviaMm)} width={ancho} height={Math.max(h, 1)} rx="3" fill="var(--color-rio-profundo)" />
                  <text x={cx(i)} y={yLluvia(d.lluviaMm) - 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-fg)">
                    {mm(d.lluviaMm)}
                  </text>
                </>
              )}
              <text x={cx(i)} y={BASE_Y + 20} textAnchor="middle" fontSize="12" fill="var(--color-fg)">
                {etiquetaDia(d.fecha)}
              </text>
              <rect
                x={cx(i) - 17}
                y={BASE_Y + 28}
                width="34"
                height="20"
                rx="10"
                fill={est.fondo}
                stroke={d.nivel ? 'none' : 'var(--color-muted)'}
                strokeDasharray={d.nivel ? undefined : '3 2'}
              />
              <text x={cx(i)} y={BASE_Y + 42} textAnchor="middle" fontSize="12" fontWeight="700" fill={est.texto}>
                {abrev}
                <title>{est.etiqueta}</title>
              </text>
            </g>
          );
        })}

        {/* Línea de humedad del suelo */}
        {tramos.map((t) => (
          <path key={t} d={t} fill="none" stroke="var(--color-rio)" strokeWidth="2.5" strokeLinejoin="round" />
        ))}
        {dias.map(
          (d, i) =>
            d.sueloMedio !== null && (
              <circle key={d.fecha} cx={cx(i)} cy={ySuelo(d.sueloMedio)} r="3.5" fill="var(--color-rio)" stroke="var(--color-card)" strokeWidth="1.5" />
            ),
        )}

        {/* Leyenda */}
        <rect x={IZQ} y={H - 18} width="12" height="12" rx="2" fill="var(--color-rio-profundo)" />
        <text x={IZQ + 17} y={H - 8} fontSize="12" fill="var(--color-fg)">
          Lluvia (mm)
        </text>
        {hayAlgunSuelo && (
          <>
            <line x1={IZQ + 100} x2={IZQ + 118} y1={H - 12} y2={H - 12} stroke="var(--color-rio)" strokeWidth="2.5" />
            <text x={IZQ + 123} y={H - 8} fontSize="12" fill="var(--color-fg)">
              Humedad del suelo
            </text>
          </>
        )}
      </svg>

      <figcaption className="mt-1 text-sm text-muted">{resumen} Debajo de cada día, el nivel de riesgo.</figcaption>
    </figure>
  );
}
