import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import createAuthLimiter from "../../middlewares/rateLimit.js";

const buildApp = (limiterOptions) => {
  const app = express();
  app.post("/probe", createAuthLimiter(limiterOptions), (req, res) => res.status(200).json({ ok: true }));
  return app;
};

describe("createAuthLimiter", () => {
  it("U-RL-01 — permite requests dentro del límite", async () => {
    const app = buildApp({ windowMs: 60_000, max: 2 });

    const res1 = await request(app).post("/probe");
    const res2 = await request(app).post("/probe");

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });

  it("U-RL-02 — bloquea con 429 al superar el límite", async () => {
    const app = buildApp({ windowMs: 60_000, max: 2 });

    await request(app).post("/probe");
    await request(app).post("/probe");
    const res3 = await request(app).post("/probe");

    expect(res3.status).toBe(429);
    expect(res3.body).toHaveProperty("message");
  });
});
