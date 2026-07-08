import Order from "../models/Order.js";
import Product from "../models/Product.js";

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Fetch all involved products in one query
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Verify availability, stock, and calculate total server-side
    let calculatedTotal = 0;

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      if (!product) {
        return res
          .status(400)
          .json({ message: `Producto no encontrado: ${item.product}` });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          message: `El producto "${product.name}" ya no está disponible`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
        });
      }

      calculatedTotal += product.price * item.quantity;
    }

    // Decrement stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Enrich items with server-side product data — never trust client fields
    const enrichedItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );
      return {
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        name: product.name,
        image: product.image,
        price: product.price,
      };
    });

    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      shippingAddress,
      paymentMethod,
      total: calculatedTotal,
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
