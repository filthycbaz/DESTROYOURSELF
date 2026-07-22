import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * @openapi
 * components:
 *   schemas:
 *     ShippingAddress:
 *       type: object
 *       required: [street, city, state, zip]
 *       properties:
 *         street: { type: string }
 *         city: { type: string }
 *         state: { type: string }
 *         zip: { type: string }
 *     OrderItem:
 *       type: object
 *       description: Enriquecido server-side — name/image/price vienen del Product en DB, nunca del cliente.
 *       properties:
 *         product: { type: string, description: "ObjectId del Product (populado en las respuestas)" }
 *         name: { type: string }
 *         image: { type: string }
 *         price: { type: number }
 *         size: { type: string }
 *         quantity: { type: integer, minimum: 1 }
 *     Order:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         user: { type: string, description: "ObjectId del User (populado con name/email en GET /all)" }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/OrderItem' }
 *         paymentMethod: { type: string, enum: [efectivo, tarjeta, transferencia] }
 *         shippingAddress: { $ref: '#/components/schemas/ShippingAddress' }
 *         status: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *         total: { type: number, description: "Calculado siempre en el servidor, nunca confía en el total del cliente" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     OrderCreateInput:
 *       type: object
 *       required: [items, shippingAddress, paymentMethod]
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required: [product, size, quantity]
 *             properties:
 *               product: { type: string, description: "ObjectId del Product" }
 *               size: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *         shippingAddress: { $ref: '#/components/schemas/ShippingAddress' }
 *         paymentMethod: { type: string, enum: [efectivo, tarjeta, transferencia] }
 *     OrderStatusUpdateInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 */
const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    paymentMethod: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia"],
      required: true,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);
export default Order;
