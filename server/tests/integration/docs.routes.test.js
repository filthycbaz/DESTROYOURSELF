import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("GET /api-docs.json", () => {
  it("I-DOC-01 — devuelve un spec OpenAPI 3 válido", async () => {
    const res = await request(app).get("/api-docs.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info).toHaveProperty("title", "DestroyYourself API");
    expect(res.body.paths).toHaveProperty("/auth/login");
    expect(res.body.components.securitySchemes).toHaveProperty("bearerAuth");
  });

  it("I-DOC-02 — incluye los schemas derivados de los modelos Mongoose", async () => {
    const res = await request(app).get("/api-docs.json");

    const schemaNames = Object.keys(res.body.components.schemas);
    expect(schemaNames).toEqual(
      expect.arrayContaining(["User", "Product", "Category", "Cart", "Order"])
    );
  });
});

describe("GET /api-docs", () => {
  it("I-DOC-03 — sirve la UI de Swagger", async () => {
    const res = await request(app).get("/api-docs/");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
  });
});
