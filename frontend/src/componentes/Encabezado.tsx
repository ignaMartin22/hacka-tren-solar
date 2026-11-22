export default function Encabezado() {
  return (
    <header className="shrink-0 border-b border-line bg-papel px-4 py-2.5 md:px-6 md:py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
        <img src="/brand/yaku-horizontal.svg" alt="Yaku" className="h-7 w-auto md:h-8" width={92} height={28} />
        <p className="text-xs text-muted sm:text-sm">Alertas satelitales para el agua del norte jujeño</p>
      </div>
    </header>
  );
}
