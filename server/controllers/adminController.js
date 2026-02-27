import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Rider from "../models/Rider.js";

// GET /admin/audit?status=&rider=&date=
export const getAuditLogs = async (req, res) => {
  try {
    const { status, rider, date } = req.query;
    const query = {};

    if (status) query.status = status;
    if (rider) query["delivery.rider"] = rider;
    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      query.createdAt = { $gte: day, $lt: nextDay };
    }

    const orders = await Order.find(query)
      .populate("user", "name")
      .populate("delivery.rider", "name")
      .lean();

    const notifications = await Notification.find({}).lean();

    // Consolidate logs
    const logs = [];

    orders.forEach((o) => {
      logs.push({
        _id: o._id,
        orderId: o._id,
        userName: o.user?.name,
        riderName: o.delivery?.rider?.name,
        type: "status",
        message: `Order status: ${o.status}`,
        createdAt: o.updatedAt || o.createdAt,
      });
    });

    notifications.forEach((n) => {
      logs.push({
        _id: n._id,
        orderId: n.orderId,
        userName: n.customerName,
        riderName: n.riderName || null,
        type: "notification",
        message: n.message,
        createdAt: n.createdAt,
      });
    });

    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching audit logs" });
  }
};

// POST /admin/notifications/send
export const sendNotification = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId).populate("user", "name phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Example: call Twilio / WhatsApp API here
    // await twilio.messages.create({ ... })

    // Save notification record
    const NotificationModel = await import("../models/Notification.js");
    const notification = await NotificationModel.default.create({
      orderId,
      customerName: order.user.name,
      type: "SMS",
      message: `Your order ${order._id.slice(-5)} is ${order.status}`,
      status: "sent",
      createdAt: new Date(),
    });

    res.json({ message: "Notification sent", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send notification" });
  }
};
