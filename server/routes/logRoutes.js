import express from "express";
import logSecurityEvent from "../config/securityLog.js";
import createAuthLimiter from "../middlewares/rateLimit.js";

const router = express.Router();

// Sin auth: un error del lado del cliente puede ocurrir antes de login (ej.
// ErrorBoundary del catálogo). Rate limit más laxo que el de auth — es un
// endpoint de solo-escritura sin efecto en datos de negocio, pero sigue
// siendo público y hay que evitar que alguien lo use para floodear logs.
const logLimiter = createAuthLimiter({ max: Number(process.env.LOG_RATE_LIMIT_MAX) || 30 });

// Trunca para que un stack trace gigante o un string manipulado no infle el
// log sin límite — no rechazamos el request, solo recortamos lo que se guarda.
const truncate = (value, max = 2000) =>
  typeof value === "string" ? value.slice(0, max) : undefined;

/**
 * @openapi
 * /logs/client:
 *   post:
 *     tags: [Logs]
 *     summary: Recibe logs estructurados del cliente (ej. errores atrapados por un ErrorBoundary)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event: { type: string, example: client.error_boundary }
 *               section: { type: string, example: catalogo }
 *               message: { type: string }
 *               componentStack: { type: string }
 *     responses:
 *       204:
 *         description: Log recibido
 *       429:
 *         description: Demasiados logs desde este IP, reintentar más tarde
 */
router.post("/client", logLimiter, (req, res) => {
  // Nunca confiar en el body crudo del cliente — solo estos campos conocidos
  // se pasan al logger, mismo criterio que la whitelist de updateProduct.
  const body = req.body ?? {};

  logSecurityEvent(truncate(body.event, 100) || "client.unknown", {
    source: "client",
    clientTimestamp: truncate(body.timestamp, 40),
    section: truncate(body.section, 100),
    message: truncate(body.message),
    componentStack: truncate(body.componentStack),
    ip: req.ip,
  });

  res.status(204).send();
});

export default router;
