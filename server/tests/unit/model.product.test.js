import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Product from "../../models/Product.js";

const buildProduct = (overrides = {}) => ({
  name: "Camiseta Test",
  category: "tops",
  price: 250,
  image: "https://example.com/img.jpg",
  sizes: ["M", "L"],
  condition: "Excelente",
  ...overrides,
});

describe("Product model", () => {
  describe("defaults", () => {
    it("U-PRD-01 — stock por defecto es 1", async () => {
      const p = await Product.create(buildProduct());
      expect(p.stock).toBe(1);
    });

    it("U-PRD-02 — isAvailable por defecto es true", async () => {
      const p = await Product.create(buildProduct());
      expect(p.isAvailable).toBe(true);
    });
  });

  describe("validaciones de esquema", () => {
    it("U-PRD-03 — category fuera de enum → ValidationError", async () => {
      await expect(
        Product.create(buildProduct({ category: "gorras-raras" }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-PRD-04 — price negativo → ValidationError", async () => {
      await expect(
        Product.create(buildProduct({ price: -1 }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-PRD-05 — condition fuera de enum → ValidationError", async () => {
      await expect(
        Product.create(buildProduct({ condition: "Destrozado" }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-PRD-06 — stock negativo → ValidationError", async () => {
      await expect(
        Product.create(buildProduct({ stock: -5 }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-PRD-07 — name requerido → ValidationError", async () => {
      await expect(
        Product.create(buildProduct({ name: undefined }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });
});
