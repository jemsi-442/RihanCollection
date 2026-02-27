import { useEffect, useState } from "react";
import axios from "../utils/axios"; // from RiderOrders.jsx
import { extractList } from "../utils/apiShape";
import useToast from "../hooks/useToast";

const AUTO_REFRESH_INTERVAL = 15000;
const SLA_SECONDS = 120;

const RiderOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [now, setNow] = useState(Date.now());
  const toast = useToast();

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/rider/orders");
      setOrders(extractList(data, ["orders", "items"]));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const refresh = setInterval(fetchOrders, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refresh);
  }, []);

  // ================= LOCAL CLOCK =================
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const hasDangerOrder = orders.some((order) => {
      if (order.delivery?.acceptedAt) return false;
      const assignedAt = order.delivery?.assignedAt;
      if (!assignedAt) return false;
      const elapsed = Math.floor((now - new Date(assignedAt).getTime()) / 1000);
      const remaining = Math.max(SLA_SECONDS - elapsed, 0);
      return remaining <= 20;
    });

    if (hasDangerOrder && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [orders, now]);

  // ================= SLA =================
  const getRemainingSeconds = (assignedAt) => {
    const elapsed = Math.floor(
      (now - new Date(assignedAt).getTime()) / 1000
    );
    return Math.max(SLA_SECONDS - elapsed, 0);
  };

  // ================= ACTION =================
  const handleAction = async (orderId, action) => {
    if (!window.confirm(`Confirm ${action}?`)) return;

    setActionLoading(orderId);
    try {
      await axios.put(`/rider/orders/${orderId}/${action}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <p className="p-4">Loading deliveries...</p>;

  if (orders.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No active deliveries 🚲
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 space-y-4">
      <h2 className="text-xl font-bold">Assigned Deliveries</h2>

      {orders.map((order) => {
        const accepted = Boolean(order.delivery?.acceptedAt);
        const assignedAt = order.delivery?.assignedAt;

        const remaining = assignedAt
          ? getRemainingSeconds(assignedAt)
          : null;

        const percent =
          remaining !== null
            ? Math.round((remaining / SLA_SECONDS) * 100)
            : 100;

        const danger = remaining !== null && remaining <= 20;

        return (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow p-4 space-y-3"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">
                Order #{order._id.slice(-6)}
              </span>

              {!accepted && remaining !== null && (
                <RadialTimer
                  percent={percent}
                  danger={danger}
                  remaining={remaining}
                />
              )}
            </div>

            {/* DETAILS */}
            <div className="text-sm space-y-1">
              <p>
                <strong>Customer:</strong> {order.user?.name}
              </p>
              <p>
                <strong>Phone:</strong> {order.user?.phone}
              </p>
              <p>
                <strong>Address:</strong> {order.delivery?.address}
              </p>
            </div>

            {/* ACTIONS */}
            {!accepted ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleAction(order._id, "accept")}
                  disabled={remaining === 0 || actionLoading === order._id}
                  className={`flex-1 py-2.5 rounded-lg text-white ${
                    remaining === 0
                      ? "bg-gray-400"
                      : "bg-green-600"
                  }`}
                >
                  Accept
                </button>

                <button
                  onClick={() => handleAction(order._id, "reject")}
                  disabled={actionLoading === order._id}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg"
                >
                  Reject
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAction(order._id, "delivered")}
                disabled={actionLoading === order._id}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                Mark Delivered
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RiderOrders;

/* ================= RADIAL TIMER ================= */
const RadialTimer = ({ percent, remaining, danger }) => {
  const stroke = 4;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="50" height="50">
      <circle
        cx="25"
        cy="25"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx="25"
        cy="25"
        r={radius}
        stroke={danger ? "#dc2626" : "#f59e0b"}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
      />
      <text
        x="25"
        y="30"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={danger ? "#dc2626" : "#f59e0b"}
      >
        {remaining}s
      </text>
    </svg>
  );
};
