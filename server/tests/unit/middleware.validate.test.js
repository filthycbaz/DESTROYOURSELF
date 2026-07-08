import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationResult } from "express-validator";
import validate from "../../middlewares/validate.js";

vi.mock("express-validator", () => ({
  validationResult: vi.fn(),
}));

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("validate middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = mockRes();
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("V-01 — sin errores llama next() exactamente una vez", () => {
    validationResult.mockReturnValue({ isEmpty: () => true });

    validate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("V-02 — con errores responde 400 con { errors: [...] }", () => {
    const fakeErrors = [{ msg: "El email no es válido", path: "email" }];
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors,
    });

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: fakeErrors });
  });

  it("V-03 — con errores no llama next()", () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "error" }],
    });

    validate(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("V-04 — sin errores no llama res.status", () => {
    validationResult.mockReturnValue({ isEmpty: () => true });

    validate(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
  });

  it("V-05 — el array de errores que llega al cliente es el mismo que devuelve validationResult", () => {
    const fakeErrors = [
      { msg: "Campo requerido", path: "name" },
      { msg: "Mínimo 6 caracteres", path: "password" },
    ];
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors,
    });

    validate(req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.errors).toBe(fakeErrors);
  });
});
