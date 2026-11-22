import type { EstadoZona } from '../api';
import { estiloNivel } from '../niveles';

// "22/11 11:21" en hora local. `datosDe` viene en UTC.
export function fechaHoraCorta(iso: string | null): string {
  if (!iso) return 'sin datos';
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} ${hora}:${min}`;
}

// Ficha de la zona elegida. Diseño: DESIGN.md sección 7.
export default function FichaZona({ zona }: { zona: EstadoZona }) {
  const estilo = estiloNivel(zona.nivel);
  return (
    <article className="rounded-card border border-line bg-card p-4 shadow-card md:p-5" aria-label={`Zona ${zona.nombre}`}>
      <header>
        <h2 className="font-display text-2xl font-bold">{zona.nombre}</h2>
        <p className="text-sm text-muted">
          {zona.region} · {zona.amenaza === 'aludes' ? 'Riesgo de aludes' : 'Sequía'}
        </p>
      </header>

      <div className={`mt-4 rounded-xl p-4 ${estilo.clase}`}>
        <p className="font-display text-[28px] leading-tight font-extrabold uppercase">{estilo.etiqueta}</p>
        <p className="mt-1 text-sm">{estilo.frase}</p>
      </div>

      {zona.nivel === null && zona.aviso && <p className="mt-3 rounded-xl bg-bg-2 p-3 text-sm">{zona.aviso}</p>}

      {zona.motivos.length > 0 && (
        <section className="mt-4" aria-label="Por qué">
          <h3 className="font-display text-lg font-bold text-terracota">Por qué</h3>
          {/* INTEGRAR: IconoMotivo — un ícono por motivo según m.codigo */}
          <ul className="mt-2 space-y-1.5 text-[15px] leading-normal">
            {zona.motivos.map((m) => (
              <li key={m.codigo}>{m.texto}</li>
            ))}
          </ul>
        </section>
      )}

      {/* INTEGRAR: GraficoTendencia — debajo de "Por qué", antes de la fecha */}

      <p className="mt-4 text-sm text-muted">Actualizado: {fechaHoraCorta(zona.datosDe)}</p>
    </article>
  );
}
