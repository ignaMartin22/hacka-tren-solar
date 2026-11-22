// Punto de entrada de /replay-demo.html: monta la pantalla del Modo Replay con el
// evento de ejemplo de frontend/src/mocks/replay.ts (DATOS DE EJEMPLO, NO REALES).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Encabezado from '../componentes/Encabezado';
import Pie from '../componentes/Pie';
import { EVENTO_REPLAY_EJEMPLO } from '../mocks/replay';
import '../index.css';
import PantallaReplay from './PantallaReplay';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex min-h-dvh flex-col">
      <Encabezado />
      <main className="flex-1">
        <PantallaReplay evento={EVENTO_REPLAY_EJEMPLO} deEjemplo />
      </main>
      <Pie />
    </div>
  </StrictMode>,
);
