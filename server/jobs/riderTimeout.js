import Order from "../models/Order.js";
import Rider from "../models/Rider.js";
import { assignRider } from "../utils/assignRider.js";

const SLA_MINUTES = 2;

export const riderAutoTimeout = async () => {
  try {
    const now = new Date();
    const timeoutThreshold = new Date(
      now.getTime() - SLA_MINUTES * 60 * 1000
    );

    // 🔎 find timed-out orders
    const timedOutOrders = await Order.find({
      status: "out_for_delivery",
      "delivery.acceptedAt": null,
      "delivery.assignedAt": { $lte: timeoutThreshold },
      "delivery.rider": { $ne: null },
    });

    if (!timedOutOrders.length) return;

    console.log(
      `⏱ Rider timeout job: ${timedOutOrders.length} order(s)`
    );

    for (const order of timedOutOrders) {
      const oldRiderId = order.delivery.rider;

      // 🔓 release old rider
      const oldRider = await Rider.findById(oldRiderId);
      if (oldRider) {
        oldRider.available = true;
        await oldRider.save();
      }

      // 🔁 assign new rider
      const newRiderId = await assignRider();

      if (!newRiderId) {
        console.warn(
          `⚠️ No rider available for order ${order._id}`
        );
        continue;
      }

      order.delivery.rider = newRiderId;
      order.delivery.assignedAt = new Date();
      order.delivery.acceptedAt = null;

      await order.save();

      console.log(
        `🔁 Order ${order._id} reassigned to rider ${newRiderId}`
      );
    }
  } catch (error) {
    console.error("🔥 riderAutoTimeout error:", error.message);
  }
};
