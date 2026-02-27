import Order from "../models/Order.js";
import Rider from "../models/Rider.js";
import { assignRider } from "../utils/assignRider.js";
import { canTransition } from "../utils/orderStatusFlow.js";

/**
 * ===============================
 * CREATE ORDER
 * ===============================
 */
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, delivery } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      delivery,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/**
 * ===============================
 * MARK ORDER AS PAID
 * → auto assign rider
 * ===============================
 */
export const markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.isPaid)
      return res.status(400).json({ message: "Order already paid" });

    if (!canTransition(order.status, "paid")) {
      return res.status(400).json({
        message: `Cannot move from ${order.status} → paid`,
      });
    }

    order.status = "paid";
    order.isPaid = true;
    order.paidAt = new Date();

    // 🚚 AUTO ASSIGN RIDER (HOME DELIVERY)
    if (order.delivery.type === "home") {
      const riderId = await assignRider();

      if (riderId) {
        order.delivery.rider = riderId;
        order.delivery.assignedAt = new Date();
        order.status = "out_for_delivery";
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("MARK PAID ERROR:", err);
    res.status(500).json({ message: "Failed to mark order as paid" });
  }
};

/**
 * ===============================
 * UPDATE ORDER STATUS (ADMIN)
 * ===============================
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!canTransition(order.status, status)) {
      return res.status(400).json({
        message: `Invalid transition ${order.status} → ${status}`,
      });
    }

    order.status = status;

    // timestamps & cleanup
    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.delivery.completedAt = new Date();

      if (order.delivery.rider) {
        await Rider.findByIdAndUpdate(order.delivery.rider, {
          available: true,
        });
      }
    }

    if (status === "cancelled" || status === "refunded") {
      if (order.delivery?.rider) {
        await Rider.findByIdAndUpdate(order.delivery.rider, {
          available: true,
        });
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/**
 * ===============================
 * GET MY ORDERS (USER)
 * ===============================
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("delivery.rider", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/**
 * ===============================
 * ADMIN – GET ALL ORDERS
 * ===============================
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("delivery.rider", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
