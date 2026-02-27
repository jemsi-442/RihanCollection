import express from "express";
import Order from "../models/Order.js";
import Rider from "../models/Rider.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { assignRider } from "../utils/assignRider.js";

const router = express.Router();

/**
 *  Rider guard
 */
const riderOnly = async (req, res, next) => {
  const rider = await Rider.findOne({ user: req.user._id });
  if (!rider) {
    return res.status(403).json({ message: "Rider access only" });
  }
  req.rider = rider;
  next();
};

/**
 *  GET assigned orders (pending accept)
 */
router.get("/orders", verifyToken, riderOnly, async (req, res) => {
  const orders = await Order.find({
    "delivery.rider": req.rider._id,
    status: "out_for_delivery",
  })
    .populate("user", "name phone")
    .sort({ "delivery.assignedAt": 1 });

  res.json(orders);
});

/**
 *  ACCEPT DELIVERY
 */
router.put(
  "/orders/:id/accept",
  verifyToken,
  riderOnly,
  async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // guard: assigned rider only
    if (!order.delivery.rider?.equals(req.rider._id)) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    // guard: already accepted
    if (order.delivery.acceptedAt) {
      return res
        .status(400)
        .json({ message: "Order already accepted" });
    }

    order.delivery.acceptedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Delivery accepted",
      order,
    });
  }
);

/**
 *  REJECT DELIVERY
 */
router.put(
  "/orders/:id/reject",
  verifyToken,
  riderOnly,
  async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!order.delivery.rider?.equals(req.rider._id)) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    //  release current rider
    req.rider.available = true;
    await req.rider.save();


    //  assign next rider
    const newRiderId = await assignRider();


    if (!newRiderId) {
      // fallback: keep order pending
      order.delivery.rider = null;
      order.status = "paid";
    } else {
      order.delivery.rider = newRiderId;
      order.delivery.assignedAt = new Date();
      order.delivery.acceptedAt = null;
      order.status = "out_for_delivery";
    }

    await order.save();

    res.json({
      success: true,
      message: "Delivery rejected & reassigned",
      order,
    });
  }
);

/**
 *  MARK AS DELIVERED
 */
router.put(
  "/orders/:id/delivered",
  verifyToken,
  riderOnly,
  async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!order.delivery.rider?.equals(req.rider._id)) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.delivery.completedAt = new Date();

    //  free rider
    req.rider.available = true;
    await req.rider.save();

    await order.save();

    res.json({
      success: true,
      message: "Order delivered successfully",
    });
  }
);

export default router;
