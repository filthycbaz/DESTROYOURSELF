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

// Admin — defined before /:id to avoid interception
router.get("/all", protect, requireAdmin, getAllOrders);
router.patch(
  "/:id/status",
  protect,
  requireAdmin,
  [body("status").isIn(ORDER_STATUSES).withMessage("Estado de orden inválido")],
  validate,
  updateOrderStatus
);

// Authenticated user
router.post(
  "/",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("La orden debe tener al menos un producto"),
    body("items.*.product").notEmpty().withMessage("Cada item debe tener un producto"),
    body("items.*.size").notEmpty().withMessage("Cada item debe tener una talla"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("La cantidad mínima es 1"),
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

router.get("/me", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

export default router;