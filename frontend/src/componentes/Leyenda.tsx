import { NIVELES_UI, ORDEN_LEYENDA } from '../niveles';

export default function Leyenda() {
  return (
    <section aria-labelledby="leyenda-titulo">
      <h2 id="leyenda-titulo" className="font-display text-[18px] font-bold text-terracota">
        Qué significa cada color
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {ORDEN_LEYENDA.map((nivel) => {
          const estilo = NIVELES_UI[nivel];
          const sinDato = nivel === 'sin-dato';
          return (
            <li key={nivel} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full ${estilo.clase} ${
                  sinDato ? 'border-2 border-dashed border-muted' : ''
                }`}
              />
              <p className="text-[14px] leading-snug text-fg">
                <span className="font-bold uppercase tracking-[0.04em]">{estilo.etiqueta}</span>
                <span className="text-muted"> · {estilo.frase}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
