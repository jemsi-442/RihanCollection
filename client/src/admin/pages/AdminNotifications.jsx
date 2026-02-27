import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FaPaperPlane } from "react-icons/fa";
import { extractList } from "../../utils/apiShape";
import PageState from "../../components/PageState";
import useToast from "../../hooks/useToast";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [error, setError] = useState("");
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/admin/audit");
      const logs = extractList(data, ["items"]);
      setNotifications(logs.filter((item) => item.type === "notification"));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendNotification = async (orderId) => {
    try {
      setSendingId(orderId);
      await axios.post(`/admin/notifications/send`, { orderId });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send notification");
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <PageState title="Loading notifications..." />;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Notifications</h1>
      {error ? (
        <PageState tone="error" title="Notifications unavailable" description={error} />
      ) : null}

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Message</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {notifications.map((n) => (
              <tr key={n._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{String(n.orderId || "").slice(-5)}</td>
                <td className="p-3">{n.customerName || n.userName || "N/A"}</td>
                <td className="p-3">{n.type}</td>
                <td className="p-3 text-sm text-gray-700">{n.message}</td>
                <td
                  className={`p-3 text-center font-semibold ${
                    n.status === "sent" ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {n.status || "logged"}
                </td>
                <td className="p-3 text-center">
                  {n.status !== "sent" && n.orderId && (
                    <button
                      onClick={() => sendNotification(n.orderId)}
                      disabled={sendingId === n.orderId}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      <FaPaperPlane />
                      <span>Send</span>
                    </button>
                  )}
                  {n.status === "sent" && <span>✓</span>}
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  No notifications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
