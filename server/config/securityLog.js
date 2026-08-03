// Logging mínimo de eventos de seguridad (login fallido, tokens inválidos,
// accesos admin rechazados) — sin agregar una dependencia de logging nueva.
// Sale por stdout como JSON de una línea para que sea fácil de grepear o
// enrutar a un colector externo más adelante.
const logSecurityEvent = (event, meta = {}) => {
  console.warn(JSON.stringify({ event, timestamp: new Date().toISOString(), ...meta }));
};

export default logSecurityEvent;
