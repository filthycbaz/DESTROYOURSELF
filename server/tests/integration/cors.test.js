// Verifica el comportamiento real de corsOptions en app.js contra las variables
// de entorno (server/config/env.js). tests/setup.js define CORS_ALLOWED_ORIGINS
// antes de importar app.js — ver el describe de abajo para el valor exacto.
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("CORS — corsOptions en app.js", () => {
  it("un origen incluido en CORS_ALLOWED_ORIGINS recibe el header Access-Control-Allow-Origin", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Origin", "http://localhost:3000");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("un origen NO incluido en CORS_ALLOWED_ORIGINS es rechazado con 403", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Origin", "https://origen-no-autorizado.example.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/origen no permitido por cors/i);
  });

  it("una request sin header Origin (curl, Postman, servidor a servidor) no es rechazada por CORS", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
  });
});
