import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         slug: { type: string }
 *         description: { type: string }
 *         isActive: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CategoryInput:
 *       type: object
 *       required: [name, slug]
 *       description: >
 *         Sin validación de express-validator a nivel de ruta — solo aplica
 *         la validación de schema de Mongoose (required, unique).
 *       properties:
 *         name: { type: string }
 *         slug: { type: string }
 *         description: { type: string }
 *         isActive: { type: boolean, default: true }
 */
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Category = model("Category", categorySchema);
export default Category;