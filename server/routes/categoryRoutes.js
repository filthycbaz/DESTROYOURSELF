import express from "express";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Lista categorías activas
 *     responses:
 *       200:
 *         description: Lista de categorías con isActive true
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
router.get("/", getCategories);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Obtiene una categoría por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", getCategoryById);

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Crea una categoría (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es admin
 */
router.post("/", protect, requireAdmin, createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Elimina una categoría (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Eliminada
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/:id", protect, requireAdmin, deleteCategory);

export default router;
