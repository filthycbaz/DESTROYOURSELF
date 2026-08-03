// controllers/productController.js
import Product from "../models/Product.js";

// GET ALL — con filtro opcional por categoría + paginación
const getProducts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip(skip).limit(limitNum);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET ONE
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// CREATE — solo admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      image,
      description,
      sizes,
      condition,
      brand,
      stock,
    } = req.body;

    const product = await Product.create({
      name,
      category,
      price,
      image,
      description,
      sizes,
      condition,
      brand,
      stock,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Campos editables de Product — nunca pasar req.body crudo a findByIdAndUpdate:
// evita mass assignment (ej. sobreescribir _id/createdAt) y cierra la ruta hacia
// el prototype pollution de mongoose en casting de update (GHSA-664h-wqgq-64gw),
// ya que solo se copian estas claves fijas, nunca las que vengan en el body.
const UPDATABLE_PRODUCT_FIELDS = [
  "name",
  "category",
  "price",
  "image",
  "description",
  "sizes",
  "condition",
  "brand",
  "stock",
  "isAvailable",
];

// UPDATE — solo admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // req.body es undefined si el request no llega con Content-Type: application/json
    // (express.json() no lo parsea) — hasOwn también evita mirar la cadena de
    // prototipos, a diferencia de `field in body`.
    const body = req.body ?? {};
    const updates = {};
    for (const field of UPDATABLE_PRODUCT_FIELDS) {
      if (Object.hasOwn(body, field)) updates[field] = body[field];
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE — solo admin
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};