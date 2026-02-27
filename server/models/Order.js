import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🔐 Order owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🛒 Ordered items
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    // 💰 Total
    totalAmount: {
      type: Number,
      required: true,
    },

    // 🚦 Order status (LOCAL delivery flow)
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    // 🚚 DELIVERY LOGIC
    delivery: {
      type: {
        type: String,
        enum: ["home", "pickup"],
        required: true,
      },

      address: {
        type: String,
        required: function () {
          return this.delivery.type === "home";
        },
      },

      contactPhone: {
        type: String,
        required: true,
      },

      rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
        default: null,
      },

      // 🔥 AUTO-SET ON ASSIGN
      assignedAt: {
        type: Date,
        default: null,
      },

      // 🟡 Rider accepted job
      acceptedAt: {
        type: Date,
        default: null,
      },

      // 🟢 Delivered time
      completedAt: {
        type: Date,
        default: null,
      },
    },

    // 💳 Payment info (future-proof)
    paymentMethod: {
      type: String,
      default: "cash_on_delivery",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Useful compound index (admin dashboard & rider queries)
orderSchema.index({
  status: 1,
  "delivery.rider": 1,
  "delivery.assignedAt": 1,
});

export default mongoose.model("Order", orderSchema);
