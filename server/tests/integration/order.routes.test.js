import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import Product from "../../models/Product.js";
import { createUser, createAdmin, createProduct, tokenFor, validAddress } from "../helpers.js";

const base = "/api/orders";

const setup = async () => {
  const user = await createUser();
  const admin = await createAdmin();
  const product = await createProduct({ price: 300, stock: 10 });
  return {
    userToken: tokenFor(user),
    adminToken: tokenFor(admin),
    product,
    productId: product._id.toString(),
  };
};

// El controller enriquece items con name/image/price del producto server-side.
// El cliente solo envía product/size/quantity.
const buildOrderBody = (productId) => ({
  items: [{ product: productId, size: "M", quantity: 2 }],
  shippingAddress: validAddress(),
  paymentMethod: "efectivo",
});

describe("POST /api/orders", () => {
  it("I-ORD-01 — stock suficiente → 201 con orden", async () => {
    const { userToken, productId } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.status).toBe("pending");
  });

  it("I-ORD-02 — total es calculado en el servidor (no acepta total del cliente)", async () => {
    const { userToken, productId } = await setup();
    const body = { ...buildOrderBody(productId), total: 999999 };

    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(body);

    expect(res.status).toBe(201);
    // total = price(300) * quantity(2) = 600, no 999999
    expect(res.body.total).toBe(600);
  });

  it("I-ORD-03 — stock se decrementa tras crear orden", async () => {
    const { userToken, productId } = await setup();
    const stockAntes = 10;

    await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    const productActualizado = await Product.findById(productId);
    expect(productActualizado.stock).toBe(stockAntes - 2);
  });

  it("I-ORD-04 — stock insuficiente → 400", async () => {
    const user = await createUser();
    const product = await createProduct({ stock: 1 });
    const token = tokenFor(user);

    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ product: product._id.toString(), size: "M", quantity: 5 }],
        shippingAddress: validAddress(),
        paymentMethod: "efectivo",
      });

    expect(res.status).toBe(400);
  });

  it("I-ORD-05 — producto no disponible (isAvailable=false) → 400", async () => {
    const user = await createUser();
    const product = await createProduct({ isAvailable: false });
    const token = tokenFor(user);

    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ product: product._id.toString(), size: "M", quantity: 1 }],
        shippingAddress: validAddress(),
        paymentMethod: "efectivo",
      });

    expect(res.status).toBe(400);
  });

  it("I-ORD-06 — paymentMethod inválido → 400", async () => {
    const { userToken, productId } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ...buildOrderBody(productId), paymentMethod: "paypal" });

    expect(res.status).toBe(400);
  });

  it("I-ORD-07 — sin auth → 401", async () => {
    const { productId } = await setup();
    const res = await request(app).post(base).send(buildOrderBody(productId));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/orders/me", () => {
  it("I-ORD-08 — lista órdenes del usuario autenticado", async () => {
    const { userToken, productId } = await setup();

    await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    const res = await request(app)
      .get(`${base}/me`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/orders/:id", () => {
  it("I-ORD-09 — usuario ve su propia orden → 200", async () => {
    const { userToken, productId } = await setup();

    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    const orderId = created.body._id;
    const res = await request(app)
      .get(`${base}/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(orderId);
  });

  it("I-ORD-10 — usuario intenta ver orden ajena → 403", async () => {
    const { userToken, productId } = await setup();
    const otroUser = await createUser();
    const otroToken = tokenFor(otroUser);

    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    const res = await request(app)
      .get(`${base}/${created.body._id}`)
      .set("Authorization", `Bearer ${otroToken}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/orders/all (admin)", () => {
  it("I-ORD-11 — admin ve todas las órdenes", async () => {
    const { adminToken } = await setup();
    const res = await request(app)
      .get(`${base}/all`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("I-ORD-12 — user normal → 403", async () => {
    const { userToken } = await setup();
    const res = await request(app)
      .get(`${base}/all`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/orders/:id/status (admin)", () => {
  it("I-ORD-13 — admin actualiza estado a 'confirmed' → 200", async () => {
    const { userToken, adminToken, productId } = await setup();

    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    const res = await request(app)
      .patch(`${base}/${created.body._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("I-ORD-14 — estado inválido → 400", async () => {
    const { userToken, adminToken, productId } = await setup();

    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildOrderBody(productId));

    const res = await request(app)
      .patch(`${base}/${created.body._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "volando" });

    expect(res.status).toBe(400);
  });
});
