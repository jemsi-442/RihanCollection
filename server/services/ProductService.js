import mongoose from "mongoose";
import Product from "../models/Product.js";
import AuditLog from "../models/AuditLog.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED_CREATE_FIELDS = [
  "name",
  "description",
  "sku",
  "price",
  "stock",
  "images",
];

const ALLOWED_UPDATE_FIELDS = ["name", "description", "price", "stock", "sku", "images"];

const normalizeImages = (images) => {
  if (!images) return undefined;
  if (!Array.isArray(images)) throw new ApiError(400, "images must be an array");

  return images
    .filter(Boolean)
    .map((item) => {
      if (typeof item === "string") {
        return { url: item };
      }

      if (typeof item === "object" && item.url) {
        return {
          url: item.url,
          publicId: item.publicId || null,
        };
      }

      throw new ApiError(400, "Invalid image payload");
    });
};

const pick = (src, allowedKeys) =>
  allowedKeys.reduce((acc, key) => {
    if (Object.hasOwn(src, key) && src[key] !== undefined) {
      acc[key] = src[key];
    }
    return acc;
  }, {});

class ProductService {
  static async getProductById(productId) {
    const product = await Product.findById(productId).lean();
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  }

  static async createProduct(input, actorId) {
    const payload = pick(input, ALLOWED_CREATE_FIELDS);

    if (payload.images !== undefined) {
      payload.images = normalizeImages(payload.images);
    }

    const product = await Product.create({
      ...payload,
      createdBy: actorId || null,
      status: "pending",
    });

    return product;
  }

  static async listProducts({ page = 1, limit = 20, status }) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const query = {};
    if (status) query.status = status;

    const [items, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }

  static async updateProduct(productId, input) {
    const payload = pick(input, ALLOWED_UPDATE_FIELDS);

    if (payload.images !== undefined) {
      payload.images = normalizeImages(payload.images);
    }

    if (Object.keys(payload).length === 0) {
      throw new ApiError(400, "No updatable fields provided");
    }

    const updated = await Product.findByIdAndUpdate(productId, { $set: payload }, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new ApiError(404, "Product not found");

    return updated;
  }

  static async deleteProduct(productId) {
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) throw new ApiError(404, "Product not found");
    return deleted;
  }

  static async approveProduct(productId, adminId) {
    const session = await mongoose.startSession();

    try {
      const executeApproval = async (txnSession = null) => {
        let approvedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            status: { $ne: "approved" },
          },
          {
            $set: {
              status: "approved",
              approvedAt: new Date(),
              approvedBy: adminId,
            },
          },
          {
            new: true,
            runValidators: true,
            session: txnSession || undefined,
          }
        );

        let wasIdempotent = false;

        if (!approvedProduct) {
          const existingQuery = Product.findById(productId);
          if (txnSession) existingQuery.session(txnSession);
          const existing = await existingQuery;

          if (!existing) {
            throw new ApiError(404, "Product not found");
          }

          if (existing.status === "approved") {
            approvedProduct = existing;
            wasIdempotent = true;
            return { approvedProduct, wasIdempotent };
          }

          throw new ApiError(409, "Unable to approve product due to conflicting state");
        }

        await AuditLog.create(
          [
            {
              userId: adminId,
              type: "status",
              action: "product_approved",
              message: `Product ${approvedProduct._id} approved`,
              meta: {
                productId: approvedProduct._id,
                status: approvedProduct.status,
              },
            },
          ],
          txnSession ? { session: txnSession } : undefined
        );

        return { approvedProduct, wasIdempotent };
      };

      try {
        let result;
        await session.withTransaction(async () => {
          result = await executeApproval(session);
        });
        return { product: result.approvedProduct, idempotent: result.wasIdempotent };
      } catch (error) {
        const txNotSupported =
          error?.message?.includes("Transaction numbers are only allowed") ||
          error?.message?.includes("replica set");

        if (!txNotSupported) throw error;

        const result = await executeApproval(null);
        return { product: result.approvedProduct, idempotent: result.wasIdempotent };
      }
    } finally {
      await session.endSession();
    }
  }
}

export default ProductService;
