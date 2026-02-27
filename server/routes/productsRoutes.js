import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { rateLimit } from "../middleware/rateLimiter.js";

const router = express.Router();

const approveRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => `${req.ip}:${req.user?._id || "anon"}:approve-product`,
});

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.put("/:id/approve", protect, adminOnly, approveRateLimiter, approveProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
