import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * @openapi
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         product: { type: string, description: "ObjectId del Product (populado en las respuestas)" }
 *         size: { type: string }
 *         quantity: { type: integer, minimum: 1 }
 *     Cart:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         user: { type: string, description: "ObjectId del User" }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/CartItem' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CartAddItemInput:
 *       type: object
 *       required: [product, size]
 *       description: Sin validación de express-validator a nivel de ruta.
 *       properties:
 *         product: { type: string, description: "ObjectId del Product" }
 *         size: { type: string }
 *         quantity: { type: integer, minimum: 1, default: 1 }
 *     CartUpdateItemInput:
 *       type: object
 *       required: [quantity]
 *       description: >
 *         La API no rechaza quantity <= 0 (solo la UI lo evita client-side) —
 *         documentado como comportamiento real, no como contrato deseado.
 *       properties:
 *         quantity: { type: integer }
 */
const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

const Cart = model("Cart", cartSchema);
export default Cart;
