import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },

    isActive: {
      type: Boolean,
      default: true,
    },

    // to avoid overloading one rider
    currentOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Rider", riderSchema);
