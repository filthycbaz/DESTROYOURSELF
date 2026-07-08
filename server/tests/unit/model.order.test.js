import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Order from "../../models/Order.js";

const validItem = () => ({
  product: new mongoose.Types.ObjectId(),
  name: "Camiseta",
  image: "https://example.com/img.jpg",
  price: 250,
  size: "M",
  quantity: 1,
});

const validAddress = () => ({
  street: "Av. Reforma 1",
  city: "CDMX",
  state: "Ciudad de México",
  zip: "06600",
});

const buildOrder = (overrides = {}) => ({
  user: new mongoose.Types.ObjectId(),
  items: [validItem()],
  paymentMethod: "efectivo",
  shippingAddress: validAddress(),
  total: 250,
  ...overrides,
});

describe("Order model", () => {
  describe("defaults", () => {
    it("U-ORD-01 — status por defecto es 'pending'", async () => {
      const order = await Order.create(buildOrder());
      expect(order.status).toBe("pending");
    });
  });

  describe("validaciones de esquema", () => {
    it("U-ORD-02 — paymentMethod inválido → ValidationError", async () => {
      await expect(
        Order.create(buildOrder({ paymentMethod: "paypal" }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-ORD-03 — status inválido → ValidationError", async () => {
      await expect(
        Order.create(buildOrder({ status: "procesando" }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-ORD-04 — items vacío es aceptado por el modelo (la restricción min:1 vive en el route validator)", async () => {
      // Mongoose 'required' en arrays solo verifica que el campo no sea null/undefined
      // La regla de negocio "mínimo 1 item" la aplica express-validator en la ruta
      const order = await Order.create(buildOrder({ items: [] }));
      expect(order.items).toHaveLength(0);
    });

    it("U-ORD-05 — shippingAddress sin city → ValidationError", async () => {
      const addr = validAddress();
      delete addr.city;
      await expect(
        Order.create(buildOrder({ shippingAddress: addr }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("U-ORD-06 — acepta los tres métodos de pago válidos", async () => {
      for (const method of ["efectivo", "tarjeta", "transferencia"]) {
        const order = await Order.create(buildOrder({ paymentMethod: method }));
        expect(order.paymentMethod).toBe(method);
      }
    });
  });
});
