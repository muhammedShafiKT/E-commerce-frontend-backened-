import Order from "../models/Order.js";
import Product from "../models/Products.js";
// CREATE order
export const createOrder = async (req, res) => {
  try {
    const { customer, items, total, paymentMethod } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      orderId: "ORD_" + Date.now(),
      customer,
      items,
      total,
      paymentMethod,
      status: paymentMethod === "cod" ? "pending" : "processing",
    });

    // ✅ Decrease stock for each item ordered
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty },
      });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order failed" });
  }
};

// GET user's orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// GET all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// UPDATE order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const prevStatus = order.status;

    // ✅ Stock logic
    if (status === "cancelled" && prevStatus !== "cancelled") {
      // Restore stock when cancelled
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty },
        });
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
};

// GET last used delivery details
export const getLastDetails = async (req, res) => {
  try {
    const lastOrder = await Order.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("customer")
      .lean();

    if (!lastOrder) return res.json(null);

    res.json(lastOrder.customer);
  } catch {
    res.status(500).json({ message: "Failed to fetch details" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting order" });
  }
};