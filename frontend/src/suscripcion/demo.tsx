import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PantallaSuscripcion, { enlaceBotDesdeEntorno } from './PantallaSuscripcion';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PantallaSuscripcion enlaceBot={enlaceBotDesdeEntorno()} />
  </StrictMode>,
);
