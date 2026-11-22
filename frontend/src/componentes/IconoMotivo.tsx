// Íconos de trazo por `codigo` de motivo. Ver frontend/DESIGN.md, sección 7.
const NUBE = 'M7 15a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a3.25 3.25 0 0 1 0 6.5H7Z';

function Interior({ codigo }: { codigo: string }) {
  switch (codigo) {
    case 'lluvia_24h':
    case 'lluvia_72h':
      return (
        <>
          <path d={NUBE} />
          <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" />
        </>
      );
    case 'pronostico_24h':
      return (
        <>
          <path d="M7 13a3.5 3.5 0 0 1-.4-6.97A5 5 0 0 1 16 7.5a3 3 0 0 1 1.5 5.6" />
          <circle cx="16" cy="17" r="4.5" />
          <path d="M16 14.5V17l1.5 1" />
        </>
      );
    case 'suelo':
      return (
        <>
          <path d="M3 8l9-4 9 4-9 4-9-4Z" />
          <path d="M3 12l9 4 9-4" />
          <path d="M3 16l9 4 9-4" />
        </>
      );
    case 'pendiente':
      return (
        <>
          <path d="M3 19L10 6l4 7 2-3 5 9H3Z" />
        </>
      );
    case 'sin_alerta':
      return <path d="M5 12.5l4.5 4.5L19 7.5" />;
    default:
      return <circle cx="12" cy="12" r="8" />;
  }
}

export default function IconoMotivo({ codigo }: { codigo: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <Interior codigo={codigo} />
    </svg>
  );
}
