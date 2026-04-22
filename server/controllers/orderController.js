import Order from "../models/Order.js";

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, total } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      total,
    });

    await order.populate("items.product");
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes acceso a esta orden" });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
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
