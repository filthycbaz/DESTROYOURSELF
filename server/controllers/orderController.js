
import Order from "../models/Order.js";

// CREATE — usuario autenticado crea una orden
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, payment, total } = req.body;

    const order = await Order.create({
      user: req.user._id,        // viene del authMiddleware
      items,
      shippingAddress,
      payment,
      total,
    });

    await order.populate("items.product");

    res.status(201).json(order);

  } catch (error) {
    next(error);
  }
};

// GET MY ORDERS — el usuario ve solo sus propias órdenes
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });   // más reciente primero

    res.status(200).json(orders);

  } catch (error) {
    next(error);
  }
};

// GET ONE — el usuario ve el detalle de una orden suya
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Verificar que la orden pertenece al usuario autenticado
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes acceso a esta orden" });
    }

    res.status(200).json(order);

  } catch (error) {
    next(error);
  }
};

// GET ALL — solo admin ve todas las órdenes
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")   // solo trae name y email del usuario
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    next(error);
  }
};

// UPDATE STATUS — solo admin actualiza el estado
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.status(200).json(order);

  } catch (error) {
    next(error);
  }
};

export { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };