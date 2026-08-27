import express from "express";

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Estado del servicio — para monitoreo/uptime checks
 *     responses:
 *       200:
 *         description: El servicio está arriba
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 uptime: { type: number, description: "Segundos desde que arrancó el proceso" }
 *                 timestamp: { type: string, format: date-time }
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
