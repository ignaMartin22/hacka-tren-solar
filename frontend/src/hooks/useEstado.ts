import { useCallback, useEffect, useRef, useState } from 'react';
import { obtenerEstado, type RespuestaEstado } from '../api';

const REFRESCO_MS = 5 * 60 * 1000;

export interface EstadoApp {
  estado: RespuestaEstado | null;
  error: string | null;
  // true solo mientras no terminó la primera carga.
  cargando: boolean;
  // true mientras hay un fetch en vuelo (primera carga o refresco).
  actualizando: boolean;
  recargar: () => void;
}

// Carga /api/estado, refresca cada 5 minutos y cuando la pestaña vuelve a estar
// visible. Si un refresco falla y ya hay datos, los datos se mantienen.
export function useEstado(): EstadoApp {
  const [estado, setEstado] = useState<RespuestaEstado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const enVuelo = useRef(false);

  const recargar = useCallback(() => {
    if (enVuelo.current) return;
    enVuelo.current = true;
    setActualizando(true);
    obtenerEstado()
      .then((nuevo) => {
        setEstado(nuevo);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => {
        enVuelo.current = false;
        setCargando(false);
        setActualizando(false);
      });
  }, []);

  useEffect(() => {
    recargar();
    const intervalo = setInterval(recargar, REFRESCO_MS);
    const alVolver = () => {
      if (document.visibilityState === 'visible') recargar();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [recargar]);

  return { estado, error, cargando, actualizando, recargar };
}
