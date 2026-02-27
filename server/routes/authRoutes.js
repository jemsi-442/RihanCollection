import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc   Register user
// @route  POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Login user
// @route  POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get all users (admin only)
// @route  GET /api/users
router.get("/users", verifyToken, adminMiddleware, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// @desc   Update user role (admin adminMiddleware)
// @route  PATCH /api/users/:id/role
router.patch("/users/:id/role", verifyToken, adminMiddleware, async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = role;
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

export default router;
