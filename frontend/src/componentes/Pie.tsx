export default function Pie() {
  return (
    <footer className="bg-bg-2 px-4 py-5 text-sm leading-normal text-muted md:px-6">
      <p>
        Yaku da una alerta de riesgo, no una predicción ni una detección confirmada. Datos satelitales y de modelos
        meteorológicos de{' '}
        <a className="text-rio-profundo underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
        . Umbrales iniciales, sin validar.
      </p>
    </footer>
  );
}
