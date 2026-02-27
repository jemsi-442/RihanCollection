import express from "express";
import mongoose from "mongoose";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * KPIs + Revenue + Orders analytics
 */
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    /* ===========================
       1️⃣ CORE KPIs
    ============================ */
    const [
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, value: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "PAID",
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, value: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      User.countDocuments(),
      Product.countDocuments(),
    ]);

    /* ===========================
       2️⃣ ORDERS STATUS BREAKDOWN
    ============================ */
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    /* ===========================
       3️⃣ REVENUE BY DAY (last 30 days)
    ============================ */
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const revenueByDay = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ===========================
       4️⃣ TOP SELLING PRODUCTS
    ============================ */
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          soldQty: { $sum: "$items.quantity" },
          revenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"],
            },
          },
        },
      },
      { $sort: { soldQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          soldQty: 1,
          revenue: 1,
        },
      },
    ]);

    /* ===========================
       5️⃣ CONVERSION (basic)
       orders / users
    ============================ */
    const conversionRate =
      totalUsers > 0
        ? ((totalOrders / totalUsers) * 100).toFixed(2)
        : 0;

    /* ===========================
       FINAL RESPONSE
    ============================ */
    res.json({
      kpis: {
        totalRevenue: totalRevenue[0]?.value || 0,
        monthlyRevenue: monthlyRevenue[0]?.value || 0,
        totalOrders,
        pendingOrders,
        totalUsers,
        totalProducts,
        conversionRate,
      },
      orderStatusStats,
      revenueByDay,
      topProducts,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Dashboard analytics failed" });
  }
});

export default router;
