import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("POST /api/logs/client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("I-LOG-01 — log válido → 204", async () => {
    const res = await request(app).post("/api/logs/client").send({
      event: "client.error_boundary",
      section: "catalogo",
      message: "boom",
      componentStack: "at HomePage",
    });

    expect(res.status).toBe(204);
  });

  it("I-LOG-02 — no requiere autenticación", async () => {
    const res = await request(app).post("/api/logs/client").send({ event: "client.error_boundary" });
    expect(res.status).not.toBe(401);
  });

  it("I-LOG-03 — body vacío no rompe el endpoint", async () => {
    const res = await request(app).post("/api/logs/client").send({});
    expect(res.status).toBe(204);
  });

  it("I-LOG-04 — loguea el evento recibido como JSON estructurado", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await request(app).post("/api/logs/client").send({
      event: "client.error_boundary",
      section: "checkout",
      message: "algo falló",
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(spy.mock.calls[0][0]);
    expect(logged.event).toBe("client.error_boundary");
    expect(logged.section).toBe("checkout");
    expect(logged.source).toBe("client");
    expect(logged).toHaveProperty("timestamp");
  });

  it("I-LOG-05 — event con tipo equivocado (no string) → 400", async () => {
    const res = await request(app).post("/api/logs/client").send({ event: 123 });
    expect(res.status).toBe(400);
  });

  it("I-LOG-06 — event vacío (\"\") → 400, no se coerciona a client.unknown en silencio", async () => {
    const res = await request(app).post("/api/logs/client").send({ event: "" });
    expect(res.status).toBe(400);
  });

  it("I-LOG-07 — section con tipo equivocado (no string) → 400", async () => {
    const res = await request(app).post("/api/logs/client").send({ event: "x", section: { nested: true } });
    expect(res.status).toBe(400);
  });
});
