
import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         category: { type: string, enum: [tops, bottoms, shoes, caps, accesorios] }
 *         price: { type: number, minimum: 0 }
 *         image: { type: string }
 *         description: { type: string }
 *         sizes: { type: array, items: { type: string } }
 *         condition: { type: string, enum: [Excelente, "Muy bueno", "Como nuevo", Bueno] }
 *         brand: { type: string }
 *         stock: { type: integer, minimum: 0 }
 *         isAvailable: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     ProductInput:
 *       type: object
 *       required: [name, category, price, image, sizes, condition]
 *       properties:
 *         name: { type: string }
 *         category: { type: string, enum: [tops, bottoms, shoes, caps, accesorios] }
 *         price: { type: number, minimum: 0 }
 *         image: { type: string }
 *         description: { type: string }
 *         sizes: { type: array, items: { type: string } }
 *         condition: { type: string, enum: [Excelente, "Muy bueno", "Como nuevo", Bueno] }
 *         brand: { type: string }
 *         stock: { type: integer, minimum: 0, default: 1 }
 *     ProductListResponse:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items: { $ref: '#/components/schemas/Product' }
 *         pagination:
 *           type: object
 *           properties:
 *             total: { type: integer }
 *             page: { type: integer }
 *             limit: { type: integer }
 *             totalPages: { type: integer }
 */
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["tops", "bottoms", "shoes", "caps", "accesorios"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sizes: {
      type: [String],
      required: true,
    },
    condition: {
      type: String,
      enum: ["Excelente", "Muy bueno", "Como nuevo", "Bueno"],
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
export default Product;