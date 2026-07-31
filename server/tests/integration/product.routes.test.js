import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createUser, createAdmin, createProduct, tokenFor } from "../helpers.js";

const base = "/api/products";

// Cada test crea sus propios datos — afterEach de setup.js los limpia entre tests
const setup = async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const product = await createProduct();
  return {
    adminToken: tokenFor(admin),
    userToken: tokenFor(user),
    productId: product._id.toString(),
  };
};

describe("GET /api/products", () => {
  it("I-PRD-01 — lista productos disponibles con paginación", async () => {
    await createProduct();
    const res = await request(app).get(base);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("products");
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it("I-PRD-02 — filtra por categoría válida", async () => {
    await createProduct({ category: "tops" });
    const res = await request(app).get(`${base}?category=tops`);

    expect(res.status).toBe(200);
    res.body.products.forEach((p) => expect(p.category).toBe("tops"));
  });

  it("I-PRD-03 — filtro por categoría sin resultados → lista vacía", async () => {
    await createProduct({ category: "tops" });
    const res = await request(app).get(`${base}?category=accesorios`);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  it("I-PRD-04 — no muestra productos con isAvailable=false", async () => {
    await createProduct({ isAvailable: false, name: "Oculto" });
    const res = await request(app).get(base);

    const nombres = res.body.products.map((p) => p.name);
    expect(nombres).not.toContain("Oculto");
  });
});

describe("GET /api/products/:id", () => {
  it("I-PRD-05 — ID existente → 200 con producto", async () => {
    const { productId } = await setup();
    const res = await request(app).get(`${base}/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(productId);
  });

  it("I-PRD-06 — ID inexistente → 404", async () => {
    const res = await request(app).get(`${base}/000000000000000000000000`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/products", () => {
  const newProduct = () => ({
    name: "Pantalón Test",
    category: "bottoms",
    price: 450,
    image: "https://example.com/pant.jpg",
    sizes: ["S", "M"],
    condition: "Muy bueno",
    stock: 3,
  });

  it("I-PRD-07 — admin crea producto → 201", async () => {
    const { adminToken } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newProduct());

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
  });

  it("I-PRD-08 — user normal → 403", async () => {
    const { userToken } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(newProduct());

    expect(res.status).toBe(403);
  });

  it("I-PRD-09 — sin autenticación → 401", async () => {
    const res = await request(app).post(base).send(newProduct());
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/products/:id", () => {
  it("I-PRD-10 — admin actualiza producto → 200 con datos nuevos", async () => {
    const { adminToken, productId } = await setup();
    const res = await request(app)
      .put(`${base}/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 999 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(999);
  });

  it("I-PRD-11 — user normal → 403", async () => {
    const { userToken, productId } = await setup();
    const res = await request(app)
      .put(`${base}/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 1 });

    expect(res.status).toBe(403);
  });

  it("I-PRD-15 — campos fuera de la whitelist se ignoran (mass assignment)", async () => {
    const { adminToken, productId } = await setup();
    const res = await request(app)
      .put(`${base}/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 500, hacked: true, _id: "000000000000000000000000" });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(500);
    expect(res.body).not.toHaveProperty("hacked");
    expect(res.body._id).toBe(productId);
  });

  it("I-PRD-16 — payload con __proto__ no contamina el objeto de update", async () => {
    const { adminToken, productId } = await setup();
    const res = await request(app)
      .put(`${base}/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(JSON.parse('{"price": 300, "__proto__": {"polluted": "yes"}}'));

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(300);
    expect({}.polluted).toBeUndefined();
  });

  it("I-PRD-17 — permite actualizar isAvailable", async () => {
    const { adminToken, productId } = await setup();
    const res = await request(app)
      .put(`${base}/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isAvailable: false });

    expect(res.status).toBe(200);
    expect(res.body.isAvailable).toBe(false);
  });
});

describe("DELETE /api/products/:id", () => {
  it("I-PRD-12 — admin elimina producto → 204", async () => {
    const { adminToken } = await setup();
    const p = await createProduct({ name: "Para borrar" });
    const res = await request(app)
      .delete(`${base}/${p._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it("I-PRD-13 — user normal → 403", async () => {
    const { userToken, productId } = await setup();
    const res = await request(app)
      .delete(`${base}/${productId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
