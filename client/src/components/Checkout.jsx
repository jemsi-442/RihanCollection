import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import useToast from "../hooks/useToast";

export default function Checkout({ cart, setCart }) {
  const [shipping, setShipping] = useState({ address: "", city: "", postalCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const token = localStorage.getItem("token");

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!shipping.address || !shipping.city || !shipping.postalCode) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const orderPayload = {
        products: cart.map((p) => ({ product: p._id, quantity: p.quantity, price: p.price })),
        totalAmount,
      };
      const { data } = await axios.post("/api/orders", orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully");
      setCart([]);
      navigate("/orders"); // redirect to user orders page
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-pink-500 flex items-center gap-2">
        <FiShoppingCart /> Checkout
      </h2>

      <div className="space-y-4">
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty 🌸</p>
        ) : (
          <div className="border rounded p-4 space-y-2">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Shipping form */}
        <div className="space-y-2">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={shipping.address}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shipping.city}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300"
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={shipping.postalCode}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={loading || cart.length === 0}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded transition"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
