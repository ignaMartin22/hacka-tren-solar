export function EsqueletoPanel() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" role="status" aria-label="Cargando zonas">
      <div className="h-4 w-48 rounded-full bg-chip" />
      <div className="h-40 rounded-card bg-chip" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-[12px] bg-chip" />
        ))}
      </div>
    </div>
  );
}

export function EsqueletoMapa() {
  return <div className="h-full w-full animate-pulse bg-chip" role="status" aria-label="Cargando mapa" />;
}
