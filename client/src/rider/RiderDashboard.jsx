import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { FaTruck, FaCheckCircle } from "react-icons/fa";
import { extractList } from "../utils/apiShape";
import PageState from "../components/PageState";
import useToast from "../hooks/useToast";

export default function RiderDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const toast = useToast();

  const fetchRiderOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/rider/orders");
      // filter only out_for_delivery
      const ordersList = extractList(data, ["orders", "items"]);
      setOrders(ordersList.filter((o) => o.status === "out_for_delivery"));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderOrders();
  }, []);

  const markDelivered = async (orderId) => {
    try {
      setUpdatingId(orderId);
      await axios.put(`/rider/orders/${orderId}/delivered`);
      fetchRiderOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to mark delivered");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <PageState title="Loading orders..." />;

  return (
    <div className="px-3 sm:px-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
        My Deliveries
      </h1>
      {error ? <PageState tone="error" title="Deliveries unavailable" description={error} /> : null}

      {orders.length === 0 && (
        <div className="text-center text-gray-500">
          No current deliveries.
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-4 rounded-lg shadow flex flex-col space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">
                Order #{order._id.slice(-5)}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="text-gray-600 text-sm">
              Customer: {order.user?.name} ({order.user?.phone || "—"})
            </div>

            <div className="text-gray-600 text-sm">
              Address: {order.delivery?.address || "Pickup"}
            </div>

            <div className="flex flex-col space-y-1">
              {order.items.map((item) => (
                <div key={item.product} className="flex justify-between text-sm">
                  <span>{item.name} x {item.qty}</span>
                  <span>TZS {item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-gray-200">
              <span className="font-medium">Total: TZS {order.totalAmount.toLocaleString()}</span>
              <button
                onClick={() => markDelivered(order._id)}
                disabled={updatingId === order._id}
                className="inline-flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                <FaCheckCircle />
                <span>Delivered</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
