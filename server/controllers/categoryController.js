import Category from "../models/Category.js";

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { getCategories, getCategoryById, createCategory, deleteCategory };
