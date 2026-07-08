import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import Category from "../../models/Category.js";
import { createAdmin, createUser, tokenFor } from "../helpers.js";

const base = "/api/categories";

const buildCategory = (overrides = {}) => ({
  name: `Categoría-${Date.now()}`,
  slug: `cat-${Date.now()}`,
  ...overrides,
});

const setup = async () => {
  const admin = await createAdmin();
  const user = await createUser();
  return { adminToken: tokenFor(admin), userToken: tokenFor(user) };
};

describe("GET /api/categories", () => {
  it("I-CAT-01 — lista categorías activas", async () => {
    await Category.create(buildCategory({ name: "Tops", slug: "tops" }));
    const res = await request(app).get(base);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Tops", slug: "tops" })])
    );
  });

  it("I-CAT-02 — no devuelve categorías inactivas", async () => {
    await Category.create(buildCategory({ name: "Oculta", slug: "oculta", isActive: false }));
    const res = await request(app).get(base);

    const nombres = res.body.map((c) => c.name);
    expect(nombres).not.toContain("Oculta");
  });
});

describe("GET /api/categories/:id", () => {
  it("I-CAT-03 — ID existente → 200", async () => {
    const cat = await Category.create(buildCategory());
    const res = await request(app).get(`${base}/${cat._id}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(cat._id.toString());
  });

  it("I-CAT-04 — ID inexistente → 404", async () => {
    const res = await request(app).get(`${base}/000000000000000000000000`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/categories", () => {
  it("I-CAT-05 — admin crea categoría → 201", async () => {
    const { adminToken } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(buildCategory({ name: "Nueva Cat", slug: "nueva-cat" }));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
  });

  it("I-CAT-06 — user normal → 403", async () => {
    const { userToken } = await setup();
    const res = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${userToken}`)
      .send(buildCategory());

    expect(res.status).toBe(403);
  });

  it("I-CAT-07 — sin auth → 401", async () => {
    const res = await request(app).post(base).send(buildCategory());
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/categories/:id", () => {
  it("I-CAT-08 — admin elimina categoría → 204", async () => {
    const { adminToken } = await setup();
    const cat = await Category.create(buildCategory());

    const res = await request(app)
      .delete(`${base}/${cat._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it("I-CAT-09 — user normal → 403", async () => {
    const { userToken } = await setup();
    const cat = await Category.create(buildCategory());

    const res = await request(app)
      .delete(`${base}/${cat._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
