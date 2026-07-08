/**
 * seed.js — DestroyYourself
 *
 * Comportamiento por defecto: idempotente, no destructivo.
 * Usa upsert para cada entidad — re-ejecutar es seguro.
 *
 * Para borrar y reinsertar desde cero:
 *   SEED_ALLOW_RESET=true node seed.js
 *
 * Usuarios crea con User.create() para que el pre-save hook
 * hashee las passwords automáticamente, igual que el flujo real de la API.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

dotenv.config();

// ─────────────────────────────────────────────────────────────
// CATEGORÍAS
//
// NOTA: Product.category es un String enum con 5 valores:
//   tops | bottoms | shoes | caps | accesorios
//
// Las categorías bolsas/relojes/posters/pins/miscelaneos existen
// en la colección Category pero NO son válidas en el enum de Product.
// Se insertan con isActive: false para documentar la discrepancia
// sin romper validaciones.
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  // Compatibles con Product.category enum
  { name: "Tops",       slug: "tops",       description: "Playeras, hoodies, suéteres y camisas",       isActive: true  },
  { name: "Bottoms",    slug: "bottoms",    description: "Jeans, pantalones y shorts",                   isActive: true  },
  { name: "Shoes",      slug: "shoes",      description: "Tenis, botas y zapatos vintage",               isActive: true  },
  { name: "Caps",       slug: "caps",       description: "Gorras y sombreros streetwear",                isActive: true  },
  { name: "Accesorios", slug: "accesorios", description: "Joyería, lentes y complementos",               isActive: true  },
  // Fuera del enum actual de Product — isActive: false hasta que se extienda el enum
  { name: "Bolsas",     slug: "bolsas",     description: "Totes, backpacks y bags vintage",              isActive: false },
  { name: "Relojes",    slug: "relojes",    description: "Relojes vintage y de colección",               isActive: false },
  { name: "Posters",    slug: "posters",    description: "Posters de arte, música y cultura urbana",     isActive: false },
  { name: "Pins",       slug: "pins",       description: "Pins y parches para customizar",               isActive: false },
  { name: "Miscelaneos",slug: "miscelaneos",description: "Piezas únicas que no entran en otra categoría",isActive: false },
];

// ─────────────────────────────────────────────────────────────
// PRODUCTOS
// Solo se usan categorías del enum: tops | bottoms | shoes | caps | accesorios
// ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name:        "SUETER NEWSHOP TINTO",
    category:    "tops",
    price:       450,
    image:       "https://cdn.cosmos.so/1fe87ed1-56c1-45e1-b725-6b6ab516cf59?format=jpeg",
    description: "SUETER OVERSIZE TINTO. TELA 100% LANA",
    sizes:       ["S", "M", "L", "XL"],
    condition:   "Excelente",
    brand:       "Vintage Japan",
    stock:       5,
    isAvailable: true,
  },
  {
    name:        "bootCUT jeans",
    category:    "bottoms",
    price:       850,
    image:       "https://cdn.cosmos.so/911feb40-9efc-480c-b018-12017b160573?format=jpeg",
    description: "pantalon BOOTcut japonés.",
    sizes:       ["28", "30", "32", "34"],
    condition:   "Como nuevo",
    brand:       "japandenim.co.",
    stock:       4,
    isAvailable: true,
  },
  {
    name:        "ADIDAS SAMBA PLATEADOS",
    category:    "shoes",
    price:       2200,
    image:       "https://cdn.cosmos.so/1aad39cb-bd04-4f1f-be8d-e6dd91126d95?format=jpeg",
    description: "adidas sambas en un colorway muy galactico",
    sizes:       ["7", "8", "9", "10", "11"],
    condition:   "Muy bueno",
    brand:       "adidas",
    stock:       3,
    isAvailable: true,
  },
  {
    name:        "offwhite bootleg cap",
    category:    "caps",
    price:       320,
    image:       "https://cdn.cosmos.so/edd0aa12-0018-48ed-83b0-17cd313f73ce?format=jpeg",
    description: "off white cap RIP VIRGIL",
    sizes:       ["One Size"],
    condition:   "Excelente",
    brand:       "Urban Tokyo",
    stock:       6,
    isAvailable: true,
  },
  {
    name:        "y2K glasses",
    category:    "accesorios",
    price:       380,
    image:       "https://cdn.cosmos.so/f1d13f4a-f0cf-4f79-bb62-470ef7a0df13?format=jpeg",
    description: "Gafas VINTAGE estilo y2k.",
    sizes:       ["One Size"],
    condition:   "Como nuevo",
    brand:       "TokyoSTYLEglasses",
    stock:       8,
    isAvailable: true,
  },
  {
    name:        "SAGE GREEN HOODIE",
    category:    "tops",
    price:       680,
    image:       "https://cdn.cosmos.so/af15df2b-2b2a-4fca-886d-637af197066e?format=jpeg",
    description: "Hoodie oversized TIPO salvaged, excelente para DESTRUIRTE.",
    sizes:       ["M", "L", "XL"],
    condition:   "Muy bueno",
    brand:       "Harajuku HOODIES",
    stock:       4,
    isAvailable: true,
  },
  {
    name:        "Tacones vintage",
    category:    "shoes",
    price:       1950,
    image:       "https://cdn.cosmos.so/abeb1b45-38f3-46f5-ae58-7548cfdd98f9?format=jpeg",
    description: "Zapatos VIntage Maison Margiela",
    sizes:       ["7", "8", "9", "10"],
    condition:   "Excelente",
    brand:       "MAison MargIela",
    stock:       2,
    isAvailable: true,
  },
  {
    name:        "WIDE LEG DENIM",
    category:    "bottoms",
    price:       720,
    image:       "https://cdn.cosmos.so/b163bf23-a329-4e6e-bf76-431daf409e08?format=jpeg",
    description: "Jeans wide leg corte japonés. Denim negro de alta calidad.",
    sizes:       ["28", "30", "32", "34"],
    condition:   "Excelente",
    brand:       "Tokyo Denim",
    stock:       5,
    isAvailable: true,
  },
  {
    name:        "transPARENT carthart tee",
    category:    "tops",
    price:       980,
    image:       "https://cdn.cosmos.so/7d728ea0-d345-4091-b523-79b2b4f46a4b?format=jpeg",
    description: "ligera como el viento, esta carthartt tee.",
    sizes:       ["S", "M", "L"],
    condition:   "Muy bueno",
    brand:       "carthartt",
    stock:       3,
    isAvailable: true,
  },
  {
    name:        "chromehearts BRACELET",
    category:    "accesorios",
    price:       260,
    image:       "https://cdn.cosmos.so/1a218709-72de-4aaa-ac1f-6d5a6fa10bb0?format=jpeg",
    description: "brazalete CHROMEhearts plata pura...",
    sizes:       ["One Size"],
    condition:   "Excelente",
    brand:       "chrome hearts",
    stock:       7,
    isAvailable: true,
  },
];

// ─────────────────────────────────────────────────────────────
// USUARIOS
//
// NO pre-hasheamos las passwords aquí.
// User.create() dispara el pre-save hook del schema que las hashea.
// Esto mantiene consistencia con el flujo real de la API.
// ─────────────────────────────────────────────────────────────
const USERS = [
  {
    name:     "Admin DestroyYourself",
    email:    "admin@destroy.com",
    password: "admin123",
    role:     "admin",
    isActive: true,
  },
  {
    name:     "Seb Reyes",
    email:    "seb@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Kai Tanaka",
    email:    "kai@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Luna Torres",
    email:    "luna@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Ryo Nakamura",
    email:    "ryo@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Mia Flores",
    email:    "mia@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Nico Saenz",
    email:    "nico@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Yuki Abe",
    email:    "yuki@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Sofía Vega",
    email:    "sofia@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
  {
    name:     "Dante Cruz",
    email:    "dante@destroy.com",
    password: "password123",
    role:     "user",
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Inserta o ignora un usuario por email.
 * Usa User.create() para disparar el pre-save hook de hashing.
 * Si el email ya existe, no modifica el registro existente.
 */
async function upsertUser(data) {
  const existing = await User.findOne({ email: data.email }).lean();
  if (existing) {
    return { status: "skipped", doc: existing };
  }
  const doc = await User.create(data);
  return { status: "created", doc };
}

/**
 * Inserta o ignora una categoría por slug.
 * No modifica categorías existentes.
 */
async function upsertCategory(data) {
  const result = await Category.findOneAndUpdate(
    { slug: data.slug },
    { $setOnInsert: data },
    { upsert: true, new: false, runValidators: true }
  );
  return result ? "skipped" : "created";
}

/**
 * Inserta o ignora un producto por nombre.
 * No modifica productos existentes (los datos de stock/precio
 * pueden haber cambiado por operaciones reales).
 */
async function upsertProduct(data) {
  const result = await Product.findOneAndUpdate(
    { name: data.name },
    { $setOnInsert: data },
    { upsert: true, new: false, runValidators: true }
  );
  return result ? "skipped" : "created";
}

// ─────────────────────────────────────────────────────────────
// RESET (solo si SEED_ALLOW_RESET=true)
// ─────────────────────────────────────────────────────────────
async function resetCollections() {
  console.log("\n⚠️  SEED_ALLOW_RESET=true — borrando colecciones...");
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("   Colecciones vaciadas: users, categories, products");
  console.log("   (Cart y Order no se tocan — son datos transaccionales)\n");
}

// ─────────────────────────────────────────────────────────────
// SEED PRINCIPAL
// ─────────────────────────────────────────────────────────────
async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI no está definida en las variables de entorno.");
    console.error("Crea un archivo server/.env con MONGO_URI=<tu URI de MongoDB>");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado\n");

    // Reset opcional
    if (process.env.SEED_ALLOW_RESET === "true") {
      await resetCollections();
    }

    // ── USUARIOS ──────────────────────────────────────────────
    console.log("Sembrando usuarios...");
    let usersCreated = 0;
    let usersSkipped = 0;

    for (const userData of USERS) {
      const { status } = await upsertUser(userData);
      if (status === "created") {
        console.log(`  + ${userData.role.padEnd(5)} — ${userData.email}`);
        usersCreated++;
      } else {
        console.log(`  ~ ya existe  — ${userData.email}`);
        usersSkipped++;
      }
    }
    console.log(`  → ${usersCreated} creados, ${usersSkipped} omitidos\n`);

    // ── CATEGORÍAS ────────────────────────────────────────────
    console.log("Sembrando categorías...");
    let categoriesCreated = 0;
    let categoriesSkipped = 0;

    for (const cat of CATEGORIES) {
      const status = await upsertCategory(cat);
      const flag = cat.isActive ? "" : " (fuera del enum de Product — isActive: false)";
      if (status === "created") {
        console.log(`  + ${cat.slug}${flag}`);
        categoriesCreated++;
      } else {
        console.log(`  ~ ya existe  — ${cat.slug}`);
        categoriesSkipped++;
      }
    }
    console.log(`  → ${categoriesCreated} creadas, ${categoriesSkipped} omitidas\n`);

    // ── PRODUCTOS ─────────────────────────────────────────────
    console.log("Sembrando productos...");
    let productsCreated = 0;
    let productsSkipped = 0;

    for (const prod of PRODUCTS) {
      const status = await upsertProduct(prod);
      if (status === "created") {
        console.log(`  + [${prod.category.padEnd(10)}] ${prod.name}`);
        productsCreated++;
      } else {
        console.log(`  ~ ya existe  — ${prod.name}`);
        productsSkipped++;
      }
    }
    console.log(`  → ${productsCreated} creados, ${productsSkipped} omitidos\n`);

    // ── RESUMEN ───────────────────────────────────────────────
    const totalUsers    = await User.countDocuments();
    const totalAdmins   = await User.countDocuments({ role: "admin" });
    const totalProducts = await Product.countDocuments();
    const totalCats     = await Category.countDocuments();

    console.log("─".repeat(50));
    console.log("✓ Seed completado");
    console.log(`  Usuarios en DB : ${totalUsers} (${totalAdmins} admin)`);
    console.log(`  Categorías en DB: ${totalCats}`);
    console.log(`  Productos en DB : ${totalProducts}`);
    console.log("─".repeat(50));

    if (usersCreated > 0) {
      console.log("\nCredenciales de acceso:");
      console.log("  Admin   — admin@destroy.com  / admin123");
      console.log("  Customer — seb@destroy.com   / password123");
      console.log("  Customer — kai@destroy.com   / password123");
    }

    console.log("\n⚠️  Inconsistencia conocida en el schema:");
    console.log("   Product.category solo acepta: tops | bottoms | shoes | caps | accesorios");
    console.log("   5 categorías (bolsas, relojes, posters, pins, miscelaneos) tienen isActive: false");
    console.log("   hasta que se extienda el enum en models/Product.js\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\nError durante el seed:", error.message);
    if (error.code === 11000) {
      console.error("Clave duplicada:", error.keyValue);
    }
    if (error.name === "ValidationError") {
      Object.values(error.errors).forEach((e) => console.error(" -", e.message));
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
