import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const createUser = async (overrides = {}) => {
  const data = {
    name: "Test User",
    email: `user-${Date.now()}@test.com`,
    password: "password123",
    role: "user",
    ...overrides,
  };
  return User.create(data);
};

export const createAdmin = (overrides = {}) =>
  createUser({ name: "Admin", email: `admin-${Date.now()}@test.com`, role: "admin", ...overrides });

export const tokenFor = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

export const createProduct = (overrides = {}) =>
  Product.create({
    name: "Camiseta Test",
    category: "tops",
    price: 250,
    image: "https://example.com/img.jpg",
    sizes: ["M", "L"],
    condition: "Excelente",
    stock: 5,
    isAvailable: true,
    ...overrides,
  });

export const validAddress = () => ({
  street: "Av. Reforma 1",
  city: "CDMX",
  state: "Ciudad de México",
  zip: "06600",
});
