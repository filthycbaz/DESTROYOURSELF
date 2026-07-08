// Pruebas de contrato: verifican que la forma real de la respuesta de cada endpoint sigue
// teniendo exactamente los campos que el cliente React lee. No valida reglas de negocio (ya
// cubierto en los tests de integración correspondientes) — solo la forma del payload.
//
// Los campos verificados están tomados directamente del código cliente real, no inventados:
//   - client/src/services/authService.js         → { token, user }
//   - client/src/pages/HomePage.jsx               → { products, pagination } / [{ slug }]
//   - client/src/context/AppContext.jsx (normalizeItem) → { items: [{ _id, product: {...}, size, quantity }] }
//   - client/src/pages/ConfirmationPage.jsx        → { _id, items: [{ name, size, quantity, price }], total }
//
// No se introduce ninguna librería de validación de esquemas (Zod/JSON Schema/OpenAPI): el
// proyecto no tiene una ya elegida, y estas aserciones puntuales alcanzan para detectar una
// ruptura de contrato sin agregar una dependencia nueva sin justificar.
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createUser, createProduct, tokenFor, authHeader, validAddress } from "../helpers.js";

describe("Contrato — POST /api/auth/login", () => {
  it("responde { token, user } y user no expone password", async () => {
    const user = await createUser({ email: "contract-login@test.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "contract-login@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toMatchObject({
      _id: user._id.toString(),
      name: expect.any(String),
      email: "contract-login@test.com",
      role: expect.any(String),
    });
    expect(res.body.user.password).toBeUndefined();
  });
});

describe("Contrato — GET /api/products", () => {
  it("responde { products, pagination } con los campos que consume ProductCard/HomePage", async () => {
    await createProduct({ name: "Contrato Producto" });

    const res = await request(app).get("/api/products?limit=5");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      pagination: {
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      category: expect.any(String),
      price: expect.any(Number),
      image: expect.any(String),
      sizes: expect.any(Array),
      condition: expect.any(String),
      stock: expect.any(Number),
      isAvailable: expect.any(Boolean),
    });
  });
});

describe("Contrato — GET /api/categories", () => {
  it("responde un array donde cada item tiene .slug (usado por HomePage para los filtros)", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toMatchObject({ slug: expect.any(String), name: expect.any(String) });
    }
  });
});

describe("Contrato — POST /api/cart", () => {
  it("responde { items: [{ _id, product, size, quantity }] } con product poblado", async () => {
    const user = await createUser();
    const product = await createProduct();

    const res = await request(app)
      .post("/api/cart")
      .set(authHeader(user))
      .send({ product: product._id.toString(), size: "M", quantity: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toMatchObject({
      _id: expect.any(String),
      size: "M",
      quantity: 1,
      product: {
        _id: product._id.toString(),
        name: expect.any(String),
        image: expect.any(String),
        price: expect.any(Number),
        category: expect.any(String),
        sizes: expect.any(Array),
        condition: expect.any(String),
      },
    });
  });
});

describe("Contrato — POST /api/orders", () => {
  it("responde { _id, items, total, status, paymentMethod, shippingAddress } — lo que lee ConfirmationPage", async () => {
    const user = await createUser();
    const product = await createProduct({ price: 300, stock: 5 });

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(user))
      .send({
        items: [{ product: product._id.toString(), size: "M", quantity: 2 }],
        shippingAddress: validAddress(),
        paymentMethod: "efectivo",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      total: 600,
      status: "pending",
      paymentMethod: "efectivo",
      shippingAddress: expect.objectContaining(validAddress()),
    });
    expect(res.body.items[0]).toMatchObject({
      name: product.name,
      size: "M",
      quantity: 2,
      price: 300,
    });
  });
});
