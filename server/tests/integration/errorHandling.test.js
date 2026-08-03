import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createAdmin, createUser, tokenFor } from "../helpers.js";

describe("Headers de seguridad (helmet)", () => {
  it("I-SEC-01 — respuestas incluyen X-Content-Type-Options: nosniff", async () => {
    const res = await request(app).get("/api/products");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("I-SEC-02 — no expone X-Powered-By", async () => {
    const res = await request(app).get("/api/products");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("CastError → 400 (no 500) en rutas con :id", () => {
  const malformedId = "no-es-un-id-valido";

  it("I-SEC-03 — GET /api/products/:id malformado → 400, no filtra mensaje interno de Mongoose", async () => {
    const res = await request(app).get(`/api/products/${malformedId}`);

    expect(res.status).toBe(400);
    expect(res.body.message).not.toMatch(/Cast to ObjectId|models\/|Schema/i);
  });

  it("I-SEC-04 — GET /api/categories/:id malformado → 400", async () => {
    const res = await request(app).get(`/api/categories/${malformedId}`);
    expect(res.status).toBe(400);
  });

  it("I-SEC-05 — GET /api/orders/:id malformado → 400 (autenticado)", async () => {
    const user = await createUser();
    const res = await request(app)
      .get(`/api/orders/${malformedId}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(res.status).toBe(400);
  });

  it("I-SEC-06 — PUT /api/products/:id malformado (admin) → 400", async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .put(`/api/products/${malformedId}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ price: 100 });

    expect(res.status).toBe(400);
  });
});
