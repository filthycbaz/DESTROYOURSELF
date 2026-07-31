import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// vi.hoisted garantiza que la fn esté disponible antes del hoisting del vi.mock
const { findById } = vi.hoisted(() => ({ findById: vi.fn() }));

vi.mock("../../models/User.js", () => ({
  default: { findById },
}));

import { protect, requireAdmin } from "../../middlewares/authMiddleware.js";

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Lee el secret en tiempo de ejecución: setup.js lo sobrescribe en beforeAll
const validToken = (payload = { id: "abc123", role: "user" }) =>
  jwt.sign(payload, process.env.JWT_SECRET);

describe("protect middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = mockRes();
    next = vi.fn();
    findById.mockReset();
  });

  it("U-MW-01 — sin header Authorization → 401", async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-02 — header sin prefijo 'Bearer ' → 401", async () => {
    req.headers.authorization = "Token abc123";

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-03 — token con firma inválida → 401", async () => {
    req.headers.authorization = "Bearer token.invalido.firma";

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-04 — token expirado → 401", async () => {
    const expired = jwt.sign({ id: "abc", role: "user" }, process.env.JWT_SECRET, { expiresIn: -1 });
    req.headers.authorization = `Bearer ${expired}`;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-05 — usuario no encontrado en BD → 401", async () => {
    findById.mockResolvedValue(null);
    req.headers.authorization = `Bearer ${validToken()}`;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-06 — usuario inactivo (isActive=false) → 401", async () => {
    findById.mockResolvedValue({ _id: "abc123", role: "user", isActive: false });
    req.headers.authorization = `Bearer ${validToken()}`;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-07 — token válido + usuario activo → llama next() y popula req.user", async () => {
    const fakeUser = { _id: "abc123", role: "user", isActive: true };
    findById.mockResolvedValue(fakeUser);
    req.headers.authorization = `Bearer ${validToken({ id: "abc123", role: "user" })}`;

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBe(fakeUser);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("requireAdmin middleware", () => {
  let req, res, next;

  beforeEach(() => {
    res = mockRes();
    next = vi.fn();
  });

  it("U-MW-08 — role 'user' → 403", () => {
    req = { user: { role: "user" } };

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("U-MW-09 — role 'admin' → llama next()", () => {
    req = { user: { role: "admin" } };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("U-MW-10 — role no admin registra un evento de seguridad (auth.forbidden)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    req = { user: { _id: "u1", role: "user" }, ip: "127.0.0.1", path: "/api/products" };

    requireAdmin(req, res, next);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("auth.forbidden"));
    warnSpy.mockRestore();
  });
});
