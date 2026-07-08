import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createUser, createProduct, tokenFor } from "../helpers.js";

const base = "/api/cart";

const setup = async () => {
  const user = await createUser();
  const product = await createProduct();
  return { token: tokenFor(user), productId: product._id.toString() };
};

describe("GET /api/cart", () => {
  it("I-CART-01 — carrito vacío en primer acceso → { items: [] }", async () => {
    const { token } = await setup();
    const res = await request(app).get(base).set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it("I-CART-07 — sin auth → 401", async () => {
    const res = await request(app).get(base);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/cart (addItem)", () => {
  it("I-CART-02 — agrega item nuevo al carrito", async () => {
    const { token, productId } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it("I-CART-03 — mismo producto+talla incrementa quantity en lugar de duplicar", async () => {
    const { token, productId } = await setup();

    await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 1 });

    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(4);
  });

  it("I-CART-04 — mismo producto con talla diferente crea item separado", async () => {
    const { token, productId } = await setup();

    await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 1 });

    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "L", quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
  });
});

describe("PUT /api/cart/:itemId (updateItem)", () => {
  it("I-CART-05 — actualiza quantity de un item", async () => {
    const { token, productId } = await setup();

    const addRes = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 1 });

    const itemId = addRes.body.items[0]._id;

    const res = await request(app)
      .put(`${base}/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it("I-CART-06 — itemId inexistente → 404", async () => {
    const { token } = await setup();

    // Crear carrito primero
    const product = await createProduct();
    await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: product._id.toString(), size: "M", quantity: 1 });

    const res = await request(app)
      .put(`${base}/000000000000000000000000`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/cart/:itemId (removeItem)", () => {
  it("I-CART-08 — elimina un item del carrito", async () => {
    const { token, productId } = await setup();

    const addRes = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 1 });

    const itemId = addRes.body.items[0]._id;

    const res = await request(app)
      .delete(`${base}/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});

describe("DELETE /api/cart (clearCart)", () => {
  it("I-CART-09 — vacía el carrito completo → items: []", async () => {
    const { token, productId } = await setup();

    await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({ product: productId, size: "M", quantity: 2 });

    const res = await request(app)
      .delete(base)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});
