import Cart from "../models/Cart.js";

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json(cart || { items: [] });
  } catch (error) {
    next(error);
  }
};

// Agrega un item; si ya existe el mismo producto+talla, incrementa cantidad
const addItem = async (req, res, next) => {
  try {
    const { product, size, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [{ product, size, quantity }] });
    } else {
      const existing = cart.items.find(
        (i) => i.product.toString() === product && i.size === size
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ product, size, quantity });
      }

      await cart.save();
    }

    await cart.populate("items.product");
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate("items.product");

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(200).json({ items: [] });

    cart.items = [];
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export { getCart, addItem, updateItem, removeItem, clearCart };
