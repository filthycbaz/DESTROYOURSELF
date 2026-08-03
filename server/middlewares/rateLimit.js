import rateLimit from "express-rate-limit";

const DEFAULT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;

// Factory en vez de instancia única — permite montar un limiter con
// windowMs/max distintos en tests unitarios sin tocar las rutas reales.
// max por defecto viene de AUTH_RATE_LIMIT_MAX (ver vitest.config.js —
// en test se sube para no toparse con el límite real de producción durante
// la suite; en producción, si no está seteada, cae a 10).
const createAuthLimiter = ({ windowMs = 15 * 60 * 1000, max = DEFAULT_MAX } = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Demasiados intentos, intenta de nuevo más tarde" },
  });

export default createAuthLimiter;
