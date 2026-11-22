// Banner neutro para cuando no se pudieron traer datos nuevos.
// Sin rojo: rojo es nivel de riesgo, no error de la app (DESIGN.md sección 7).
export default function BannerDatosViejos() {
  return (
    <p role="status" className="rounded-xl border-l-4 border-muted bg-bg-2 p-3 text-sm">
      No pudimos actualizar. Mostramos los últimos datos guardados.
    </p>
  );
}
