import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_METHODS = ["efectivo", "tarjeta", "transferencia"];
// Tope defensivo por item — el stock real ya lo valida orderController,
// esto solo evita cantidades absurdas (ej. 999999) mientras haya stock suficiente.
const MAX_QUANTITY_PER_ITEM = 20;

/**
 * @openapi
 * /orders/all:
 *   get:
 *     tags: [Orders]
 *     summary: Lista todas las órdenes (solo admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las órdenes, con user (name, email) e items.product poblados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 *       403:
 *         description: No es admin
 */
// Admin — defined before /:id to avoid interception
router.get("/all", protect, requireAdmin, getAllOrders);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Actualiza el estado de una orden (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderStatusUpdateInput' }
 *     responses:
 *       200:
 *         description: Orden actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/:id/status",
  protect,
  requireAdmin,
  [body("status").isIn(ORDER_STATUSES).withMessage("Estado de orden inválido")],
  validate,
  updateOrderStatus
);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Crea una orden — verifica stock/disponibilidad y calcula el total en el servidor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderCreateInput' }
 *     responses:
 *       201:
 *         description: Orden creada (stock decrementado)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Producto inexistente, no disponible, stock insuficiente o validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 */
// Authenticated user
router.post(
  "/",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("La orden debe tener al menos un producto"),
    body("items.*.product").notEmpty().withMessage("Cada item debe tener un producto"),
    body("items.*.size").notEmpty().withMessage("Cada item debe tener una talla"),
    body("items.*.quantity")
      .isInt({ min: 1, max: MAX_QUANTITY_PER_ITEM })
      .withMessage(`La cantidad debe ser entre 1 y ${MAX_QUANTITY_PER_ITEM}`),
    body("shippingAddress.street").notEmpty().withMessage("La calle es requerida"),
    body("shippingAddress.city").notEmpty().withMessage("La ciudad es requerida"),
    body("shippingAddress.state").notEmpty().withMessage("El estado es requerido"),
    body("shippingAddress.zip").notEmpty().withMessage("El código postal es requerido"),
    body("paymentMethod")
      .isIn(PAYMENT_METHODS)
      .withMessage("Método de pago inválido"),
  ],
  validate,
  createOrder
);

/**
 * @openapi
 * /orders/me:
 *   get:
 *     tags: [Orders]
 *     summary: Lista las órdenes propias del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Órdenes del usuario, ordenadas por fecha descendente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 */
router.get("/me", protect, getMyOrders);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtiene el detalle de una orden propia
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       403:
 *         description: La orden no pertenece al usuario autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", protect, getOrderById);

export default router;