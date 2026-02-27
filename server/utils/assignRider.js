import Rider from "../models/Rider.js";
import Order from "../models/Order.js";

/**
 * Assign rider using FAIR LOAD BALANCING
 *
 * Strategy:
 * 1. Only available riders
 * 2. Count today's active deliveries
 * 3. Pick rider with lowest load
 * 4. Lock rider immediately
 */
export const assignRider = async () => {
  // 🔎 find all available riders
  const riders = await Rider.find({ available: true });

  if (!riders.length) {
    console.warn(" No available riders");
    return null;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  //  calculate load per rider
  const riderLoads = await Promise.all(
    riders.map(async (rider) => {
      const activeOrders = await Order.countDocuments({
        "delivery.rider": rider._id,
        status: { $in: ["out_for_delivery"] },
        createdAt: { $gte: todayStart },
      });

      return {
        rider,
        load: activeOrders,
      };
    })
  );

  // sort by lowest load
  riderLoads.sort((a, b) => a.load - b.load);

  //  pick best rider
  const selectedRider = riderLoads[0].rider;

  //  lock rider immediately
  selectedRider.available = false;
  selectedRider.lastAssignedAt = new Date();
  await selectedRider.save();

  console.log(
    ` Rider assigned: ${selectedRider.name} | Load: ${riderLoads[0].load}`
  );

  return selectedRider._id;
};
