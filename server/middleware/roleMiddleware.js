import { requireRole } from "./authMiddleware.js";

export const adminMiddleware = requireRole("admin");
export const deliveryMiddleware = requireRole("rider", "delivery");
