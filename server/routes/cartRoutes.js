import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getCart, addItem, updateItem, removeItem, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.use(protect); // todos los endpoints requieren auth

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Obtiene el carrito del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito (o { items[] } si no existe todavía)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 */
router.get("/", getCart);

/**
 * @openapi
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Agrega un item al carrito (incrementa cantidad si ya existe product+size)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CartAddItemInput' }
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 */
router.post("/", addItem);

/**
 * @openapi
 * /cart/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Actualiza la cantidad de un item del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CartUpdateItemInput' }
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       404:
 *         description: Carrito o item no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put("/:itemId", updateItem);

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Vacía el carrito completo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vacío
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 */
router.delete("/", clearCart);

/**
 * @openapi
 * /cart/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Elimina un item del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       404:
 *         description: Carrito o item no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/:itemId", removeItem);

export default router;
