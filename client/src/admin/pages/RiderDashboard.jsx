import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import {
  FaBoxOpen,
  FaCheck,
  FaTruck,
  FaBell,
} from "react-icons/fa";
import useToast from "../../hooks/useToast";

export default function RiderDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/rider/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Poll every 15s for updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await axios.put(`/rider/orders/${orderId}/status`, { status: nextStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Rider Dashboard</h1>

      {loading ? (
        <div className="text-gray-500">Loading orders...</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border p-4 rounded-lg shadow hover:shadow-lg bg-white"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-gray-700">
                  Order {order._id.slice(-5)}
                </h2>
                <span className="text-sm text-gray-500">{order.status}</span>
              </div>

              <div className="mt-2">
                <p>User: {order.user.name}</p>
                <p>Items: {order.items.length}</p>
                <p>
                  Delivery: {order.delivery.type} - {order.delivery.address}
                </p>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                {order.status === "paid" && (
                  <button
                    onClick={() => updateStatus(order._id, "out_for_delivery")}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                  >
                    <FaTruck /> Start Delivery
                  </button>
                )}

                {order.status === "out_for_delivery" && (
                  <button
                    onClick={() => updateStatus(order._id, "delivered")}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1"
                  >
                    <FaCheck /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center text-gray-500">No orders assigned</div>
          )}
        </div>
      )}
    </div>
  );
}
