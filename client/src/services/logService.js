import { API_URL } from "../config/api";

// Logger centralizado del cliente: misma estructura (event, timestamp, +meta)
// que logSecurityEvent del backend. Fire-and-forget a propósito — si el log
// no llega (API caída, red cortada), no debe tumbar ni bloquear la UI que lo
// está reportando, y no reintentamos para no encadenar fallos.
export const logEvent = (event, meta = {}) => {
  const payload = { event, timestamp: new Date().toISOString(), ...meta };

  fetch(`${API_URL}/logs/client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Sin retry ni logEvent recursivo: perder un log no es un error que reportar.
  });

  return payload;
};
