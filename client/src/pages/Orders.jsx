import { useEffect, useState } from "react";
import api from "../utils/axios";
import OrderCard from "../components/OrderCard";
import { motion } from "framer-motion";
import { extractList } from "../utils/apiShape";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/orders/my")
      .then((res) => {
        setOrders(extractList(res.data, ["orders", "items"]));
      })
      .catch(() => {
        setOrders([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-center text-primary mb-6"
      >
        Orders Zangu 👜
      </motion.h2>

      <div className="max-w-4xl mx-auto grid gap-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">
            Bado huja-order chochote 💔
          </p>
        ) : (
          orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
