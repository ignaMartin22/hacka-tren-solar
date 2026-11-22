import '../env';

// Crea un aviso de simulacro en el backend desplegado, para mostrar el circuito en la demo.
// Naranja sale al instante a los suscriptos de la zona; rojo queda pendiente hasta confirmarlo en la vista institucional.
// Uso: pnpm --filter yaku-backend simulacro <zonaId> <naranja|rojo> [url del backend]
// Lee ADMIN_PASSWORD de backend/.env (tiene que ser la misma clave que en el servidor).

const [zonaId, nivel, url = 'https://hacka-tren-solar.onrender.com'] = process.argv.slice(2);
if (!zonaId || !nivel) throw new Error('Uso: simulacro <zonaId> <naranja|rojo> [url]');

const json = { 'content-type': 'application/json' };
const login = await fetch(`${url}/api/login`, { method: 'POST', headers: json, body: JSON.stringify({ clave: process.env.ADMIN_PASSWORD ?? '' }) });
if (!login.ok) throw new Error(`No se pudo entrar (${login.status}): revisar ADMIN_PASSWORD en backend/.env`);
const { token } = (await login.json()) as { token: string };

const res = await fetch(`${url}/api/admin/simulacros`, { method: 'POST', headers: { ...json, authorization: `Bearer ${token}` }, body: JSON.stringify({ zonaId, nivel }) });
const cuerpo = (await res.json()) as { aviso?: { zonaNombre: string; nivel: string; estado: string; destinatarios: number }; error?: string };
if (!res.ok || !cuerpo.aviso) throw new Error(cuerpo.error ?? `El servidor respondió ${res.status}`);
console.log(`Simulacro ${cuerpo.aviso.nivel.toUpperCase()} en ${cuerpo.aviso.zonaNombre}: ${cuerpo.aviso.estado}, ${cuerpo.aviso.destinatarios} destinatario(s).`);
