import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("GET /api/health", () => {
  it("I-HEALTH-01 — responde ok con uptime y timestamp", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
    expect(new Date(res.body.timestamp).toString()).not.toBe("Invalid Date");
  });
});
