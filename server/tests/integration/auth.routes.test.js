import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

const base = "/api/auth";

const validUser = () => ({
  name: "Test User",
  email: `user-${Date.now()}-${Math.random()}@test.com`,
  password: "password123",
});

describe("POST /api/auth/register", () => {
  it("I-AUTH-01 — datos válidos → 201 con token y user sin password", async () => {
    const data = validUser();
    const res = await request(app).post(`${base}/register`).send(data);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", data.email);
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("I-AUTH-02 — email duplicado → 400", async () => {
    const data = validUser();
    await request(app).post(`${base}/register`).send(data);
    const res = await request(app).post(`${base}/register`).send(data);

    expect(res.status).toBe(400);
  });

  it("I-AUTH-03 — email inválido → 400 con errors[]", async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ name: "Ana", email: "no-es-email", password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("I-AUTH-04 — password menor a 6 chars → 400", async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ name: "Ana", email: "ana@test.com", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("I-AUTH-05 — name vacío → 400", async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ name: "", email: "ana@test.com", password: "123456" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("I-AUTH-06 — credenciales correctas → 200 con token", async () => {
    const data = validUser();
    await request(app).post(`${base}/register`).send(data);

    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: data.email, password: data.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("I-AUTH-07 — password incorrecta → 401", async () => {
    const data = validUser();
    await request(app).post(`${base}/register`).send(data);

    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: data.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("I-AUTH-08 — email no registrado → 401", async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: "noexiste@test.com", password: "password123" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("I-AUTH-09 — token válido → 200 con datos del usuario", async () => {
    const data = validUser();
    const reg = await request(app).post(`${base}/register`).send(data);
    const token = reg.body.token;

    const res = await request(app)
      .get(`${base}/me`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email", data.email);
    expect(res.body).not.toHaveProperty("password");
  });

  it("I-AUTH-10 — sin token → 401", async () => {
    const res = await request(app).get(`${base}/me`);
    expect(res.status).toBe(401);
  });
});
