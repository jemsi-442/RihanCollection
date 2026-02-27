import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: { type: String, enum: ["status", "delivery", "refund"], required: true },
    message: { type: String, required: true },
    phone: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
