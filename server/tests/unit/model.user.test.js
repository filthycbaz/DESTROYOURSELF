import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import User from "../../models/User.js";

const buildUser = (overrides = {}) => ({
  name: "Test User",
  email: `test-${Date.now()}-${Math.random()}@example.com`,
  password: "password123",
  ...overrides,
});

describe("User model", () => {
  describe("pre save — hashing", () => {
    it("U-USR-01 — hashea la contraseña al crear", async () => {
      const user = await User.create(buildUser());

      expect(user.password).not.toBe("password123");
      expect(user.password).toMatch(/^\$2[ab]\$/);
    });

    it("U-USR-02 — no re-hashea si el password no cambió", async () => {
      const user = await User.create(buildUser());
      const hashOriginal = user.password;

      user.name = "Nombre actualizado";
      await user.save();

      expect(user.password).toBe(hashOriginal);
    });

    it("U-USR-02b — sí re-hashea si el password cambió", async () => {
      const user = await User.create(buildUser());
      const hashOriginal = user.password;

      user.password = "nuevoPassword456";
      await user.save();

      expect(user.password).not.toBe(hashOriginal);
      expect(user.password).toMatch(/^\$2[ab]\$/);
    });
  });

  describe("comparePassword", () => {
    it("U-USR-03 — retorna true con la contraseña correcta", async () => {
      const user = await User.create(buildUser({ password: "miPassword123" }));

      const resultado = await user.comparePassword("miPassword123");

      expect(resultado).toBe(true);
    });

    it("U-USR-04 — retorna false con contraseña incorrecta", async () => {
      const user = await User.create(buildUser({ password: "miPassword123" }));

      const resultado = await user.comparePassword("passwordMal");

      expect(resultado).toBe(false);
    });
  });

  describe("toJSON — seguridad", () => {
    it("U-USR-05 — no expone el campo password en la serialización", async () => {
      const user = await User.create(buildUser());

      const serializado = user.toJSON();

      expect(serializado).not.toHaveProperty("password");
    });

    it("U-USR-05b — sí expone name, email y role", async () => {
      const user = await User.create(buildUser({ name: "Ana", email: `ana-${Date.now()}@test.com` }));

      const serializado = user.toJSON();

      expect(serializado).toHaveProperty("name", "Ana");
      expect(serializado).toHaveProperty("email");
      expect(serializado).toHaveProperty("role", "user");
    });
  });

  describe("validaciones de esquema", () => {
    it("U-USR-06 — role por defecto es 'user'", async () => {
      const user = await User.create(buildUser());
      expect(user.role).toBe("user");
    });

    it("U-USR-07 — isActive por defecto es true", async () => {
      const user = await User.create(buildUser());
      expect(user.isActive).toBe(true);
    });

    it("U-USR-08 — role inválido lanza ValidationError", async () => {
      await expect(
        User.create(buildUser({ role: "superadmin" }))
      ).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });
});
