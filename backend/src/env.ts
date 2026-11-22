// Se importa primero en index.ts para que backend/.env esté cargado antes que el resto de los módulos.
try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch {
  // Sin archivo .env: se usan las variables del entorno.
}
