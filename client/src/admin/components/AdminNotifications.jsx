import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { FaBell } from "react-icons/fa";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-2">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <FaBell /> Notifications
      </h2>
      {notifications.length === 0 && <p className="text-gray-500">No notifications</p>}
      <ul className="space-y-1">
        {notifications.map((n) => (
          <li key={n._id} className="border p-2 rounded bg-gray-50 hover:bg-gray-100">
            <p>{n.message}</p>
            <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
