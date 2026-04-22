// controllers/productController.js
import Product from "../models/Product.js";

// GET ALL — con filtro opcional por categoría + paginación
const getProducts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category ? { category } : {};

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

// UPDATE — solo admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {
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