import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PantallaInstitucional from './PantallaInstitucional';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PantallaInstitucional />
  </StrictMode>,
);
