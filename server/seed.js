import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import User from "./models/User.js";

dotenv.config();

// ── CATEGORÍAS ──────────────────────────────────────────────
const categories = [
  { name: "Tops",        slug: "tops",         description: "Playeras, hoodies, suéteres y camisas" },
  { name: "Bottoms",     slug: "bottoms",       description: "Jeans, pantalones y shorts" },
  { name: "Shoes",       slug: "shoes",         description: "Tenis, botas y zapatos vintage" },
  { name: "Caps",        slug: "caps",          description: "Gorras y sombreros streetwear" },
  { name: "Accesorios",  slug: "accesorios",    description: "Joyería, lentes y complementos" },
  { name: "Bolsas",      slug: "bolsas",        description: "Totes, backpacks y bags vintage" },
  { name: "Relojes",     slug: "relojes",       description: "Relojes vintage y de colección" },
  { name: "Posters",     slug: "posters",       description: "Posters de arte, música y cultura urbana" },
  { name: "Pins",        slug: "pins",          description: "Pins y parches para customizar" },
  { name: "Miscelaneos", slug: "miscelaneos",   description: "Piezas únicas que no entran en otra categoría" },
];

// ── PRODUCTOS ────────────────────────────────────────────────
const products = [
  {
    name: "SUETER NEWSHOP TINTO",
    category: "tops",
    price: 450,
    image: "https://cdn.cosmos.so/1fe87ed1-56c1-45e1-b725-6b6ab516cf59?format=jpeg",
    description: "SUETER OVERSIZE TINTO. TELA 100% LANA",
    sizes: ["S", "M", "L", "XL"],
    condition: "Excelente",
    brand: "Vintage Japan",
  },
  {
    name: "bootCUT jeans",
    category: "bottoms",
    price: 850,
    image: "https://cdn.cosmos.so/911feb40-9efc-480c-b018-12017b160573?format=jpeg",
    description: "pantalon BOOTcut japonés.",
    sizes: ["28", "30", "32", "34"],
    condition: "Como nuevo",
    brand: "japandenim.co.",
  },
  {
    name: "ADIDAS SAMBA PLATEADOS",
    category: "shoes",
    price: 2200,
    image: "https://cdn.cosmos.so/1aad39cb-bd04-4f1f-be8d-e6dd91126d95?format=jpeg",
    description: "adidas sambas en un colorway muy galactico",
    sizes: ["7", "8", "9", "10", "11"],
    condition: "Muy bueno",
    brand: "adidas",
  },
  {
    name: "offwhite bootleg cap",
    category: "caps",
    price: 320,
    image: "https://cdn.cosmos.so/edd0aa12-0018-48ed-83b0-17cd313f73ce?format=jpeg",
    description: "off white cap RIP VIRGIL",
    sizes: ["One Size"],
    condition: "Excelente",
    brand: "Urban Tokyo",
  },
  {
    name: "y2K glasses",
    category: "accesorios",
    price: 380,
    image: "https://cdn.cosmos.so/f1d13f4a-f0cf-4f79-bb62-470ef7a0df13?format=jpeg",
    description: "Gafas VINTAGE estilo y2k.",
    sizes: ["One Size"],
    condition: "Como nuevo",
    brand: "TokyoSTYLEglasses",
  },
  {
    name: "SAGE GREEN HOODIE",
    category: "tops",
    price: 680,
    image: "https://cdn.cosmos.so/af15df2b-2b2a-4fca-886d-637af197066e?format=jpeg",
    description: "Hoodie oversized TIPO salvaged, excelente para DESTRUIRTE.",
    sizes: ["M", "L", "XL"],
    condition: "Muy bueno",
    brand: "Harajuku HOODIES",
  },
  {
    name: "Tacones vintage",
    category: "shoes",
    price: 1950,
    image: "https://cdn.cosmos.so/abeb1b45-38f3-46f5-ae58-7548cfdd98f9?format=jpeg",
    description: "Zapatos VIntage Maison Margiela",
    sizes: ["7", "8", "9", "10"],
    condition: "Excelente",
    brand: "MAison MargIela",
  },
  {
    name: "WIDE LEG DENIM",
    category: "bottoms",
    price: 720,
    image: "https://cdn.cosmos.so/b163bf23-a329-4e6e-bf76-431daf409e08?format=jpeg",
    description: "Jeans wide leg corte japonés. Denim negro de alta calidad, silueta holgada y moderna.",
    sizes: ["28", "30", "32", "34"],
    condition: "Excelente",
    brand: "Tokyo Denim",
  },
  {
    name: "transPARENT carthart tee",
    category: "tops",
    price: 980,
    image: "https://cdn.cosmos.so/7d728ea0-d345-4091-b523-79b2b4f46a4b?format=jpeg",
    description: "ligera como el viento, esta carthartt tee.",
    sizes: ["S", "M", "L"],
    condition: "Muy bueno",
    brand: "carthartt",
  },
  {
    name: "chromehearts BRACELET",
    category: "accesorios",
    price: 260,
    image: "https://cdn.cosmos.so/1a218709-72de-4aaa-ac1f-6d5a6fa10bb0?format=jpeg",
    description: "brazalete CHROMEhearts plata pura...",
    sizes: ["One Size"],
    condition: "Excelente",
    brand: "chrome hearts",
  },
];

// ── USUARIOS ─────────────────────────────────────────────────
const users = [
  { name: "Admin destroyyourself", email: "admin@destroy.com",   password: "admin123",  role: "admin" },
  { name: "Seb Reyes",            email: "seb@destroy.com",     password: "password123", role: "user" },
  { name: "Kai Tanaka",           email: "kai@destroy.com",     password: "password123", role: "user" },
  { name: "Luna Torres",          email: "luna@destroy.com",    password: "password123", role: "user" },
  { name: "Ryo Nakamura",         email: "ryo@destroy.com",     password: "password123", role: "user" },
  { name: "Mia Flores",           email: "mia@destroy.com",     password: "password123", role: "user" },
  { name: "Nico Saenz",           email: "nico@destroy.com",    password: "password123", role: "user" },
  { name: "Yuki Abe",             email: "yuki@destroy.com",    password: "password123", role: "user" },
  { name: "Sofía Vega",           email: "sofia@destroy.com",   password: "password123", role: "user" },
  { name: "Dante Cruz",           email: "dante@destroy.com",   password: "password123", role: "user" },
];

// ── SEED ─────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");

    // Limpiar colecciones
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log("Colecciones limpiadas");

    // Insertar categorías
    await Category.insertMany(categories);
    console.log(`${categories.length} categorías insertadas`);

    // Insertar productos
    await Product.insertMany(products);
    console.log(`${products.length} productos insertados`);

    // Hashear passwords y insertar usuarios
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );
    await User.insertMany(hashedUsers);
    console.log(`${users.length} usuarios insertados`);

    console.log("\n✓ Seed completado correctamente");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error en seed:", error);
    process.exit(1);
  }
};

seed();