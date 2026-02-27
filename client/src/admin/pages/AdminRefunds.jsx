import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { FaUndoAlt, FaCheckCircle } from "react-icons/fa";
import useToast from "../../hooks/useToast";

export default function AdminRefunds() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const toast = useToast();

  const fetchRefundableOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/orders");
      // Only orders eligible for refund
      setOrders(data.filter(o => ["paid", "out_for_delivery", "delivered"].includes(o.status)));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundableOrders();
  }, []);

  const processRefund = async (orderId) => {
    try {
      setProcessingId(orderId);
      await axios.put(`/orders/${orderId}/status`, { status: "refunded" });
      fetchRefundableOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading orders...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Refund Management</h1>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Delivery</th>
              <th className="p-3">Rider</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{order.user?.name}</div>
                  <div className="text-xs text-gray-500">{order.user?.email}</div>
                </td>

                <td className="p-3 text-center font-semibold">
                  TZS {order.totalAmount.toLocaleString()}
                </td>

                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${order.status === "refunded" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                    {order.status.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="p-3 text-center">{order.delivery?.type}</td>

                <td className="p-3 text-center text-xs">
                  {order.delivery?.rider ? (
                    <>
                      <div className="font-medium">{order.delivery.rider.name}</div>
                      <div className="text-gray-500">{order.delivery.rider.phone}</div>
                    </>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="p-3 text-center space-x-2">
                  {order.status !== "refunded" && (
                    <button
                      onClick={() => processRefund(order._id)}
                      disabled={processingId === order._id}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                    >
                      <FaUndoAlt />
                      <span>Refund</span>
                    </button>
                  )}
                  {order.status === "refunded" && (
                    <span className="text-green-600 font-semibold text-xs flex items-center justify-center">
                      <FaCheckCircle className="mr-1" /> Refunded
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Trail */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700">Audit Trail</h2>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          {orders.flatMap(order => 
            order.audit?.map((a, idx) => (
              <li key={`${order._id}-${idx}`}>
                {new Date(a.timestamp).toLocaleString()} – {a.action} by {a.user}
              </li>
            ))
          )}
          {orders.every(o => !o.audit?.length) && (
            <li>No audit records yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
