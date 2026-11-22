// Único lugar con los colores y textos del semáforo. Ver frontend/DESIGN.md, sección 3.
// Mapa, ficha, lista y leyenda importan de acá: no repetir colores en otros archivos.
import type { Nivel } from '../../config/riesgo';

export type NivelOSinDato = Nivel | 'sin-dato';

export interface EstiloNivel {
  // Palabra que acompaña siempre al color (el color nunca va solo).
  etiqueta: string;
  // Frase corta para la leyenda y la ficha, sin jerga.
  frase: string;
  // HEX para lo que no pasa por Tailwind (marcadores de Leaflet).
  fondo: string;
  texto: string;
  // Clases de Tailwind para badges y franjas.
  clase: string;
}

export const NIVELES_UI: Record<NivelOSinDato, EstiloNivel> = {
  verde: {
    etiqueta: 'VERDE',
    frase: 'Sin señales de riesgo.',
    fondo: '#3C5833',
    texto: '#FFFFFF',
    clase: 'bg-nivel-verde text-white',
  },
  amarillo: {
    etiqueta: 'AMARILLO',
    frase: 'Lluvia o suelo húmedo. Estar informados.',
    fondo: '#E8B517',
    texto: '#140D0C',
    clase: 'bg-nivel-amarillo text-noche',
  },
  naranja: {
    etiqueta: 'NARANJA',
    frase: 'Lluvia fuerte y suelo muy húmedo. Estar atentos.',
    fondo: '#EC7120',
    texto: '#140D0C',
    clase: 'bg-nivel-naranja text-noche',
  },
  rojo: {
    etiqueta: 'ROJO',
    frase: 'Riesgo alto de aludes. Seguir a Defensa Civil.',
    fondo: '#B32814',
    texto: '#FFFFFF',
    clase: 'bg-nivel-rojo text-white',
  },
  'sin-dato': {
    etiqueta: 'SIN DATO',
    frase: 'Todavía no calculamos el nivel de esta zona.',
    fondo: '#D9CFC6',
    texto: '#2A1A16',
    clase: 'bg-nivel-sin-dato text-fg',
  },
};

// Orden para la leyenda: de menor a mayor riesgo, y "sin dato" al final.
export const ORDEN_LEYENDA: NivelOSinDato[] = ['verde', 'amarillo', 'naranja', 'rojo', 'sin-dato'];

export const estiloNivel = (nivel: Nivel | null): EstiloNivel => NIVELES_UI[nivel ?? 'sin-dato'];
