import { useState } from "react";
import api from "../utils/axios";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";

const STEPS = ["delivery", "payment", "review"];

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const toast = useToast();
  const cartItems = cart;
  const [step, setStep] = useState(0);

  const [delivery, setDelivery] = useState({
    type: "home", // home | pickup
    address: "",
    contactPhone: "",
  });

  const [payment, setPayment] = useState({
    method: "cash", // cash | mobile_money
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const deliveryFee = delivery.type === "home" ? 3000 : 0;
  const total = subtotal + deliveryFee;

  // ================= ACTIONS =================

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const canContinueDelivery =
    delivery.contactPhone && (delivery.type === "pickup" || delivery.address);

  const placeOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!delivery.contactPhone) {
      toast.error("Contact phone is required");
      return;
    }

    if (delivery.type === "home" && !delivery.address) {
      toast.error("Delivery address is required for home delivery");
      return;
    }

    const payload = {
      items: cartItems.map((i) => ({
        product: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
      delivery,
      payment,
      totalAmount: total,
    };

    try {
      const { data } = await api.post("/orders", payload);

      toast.success("Order placed successfully");
      console.log("ORDER:", data);
      clearCart();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  // ================= UI =================

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>

      {/* STEP INDICATOR */}
      <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`px-3 py-1 rounded ${
              step === i ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {s.toUpperCase()}
          </span>
        ))}
      </div>

      {/* ================= DELIVERY ================= */}
      {STEPS[step] === "delivery" && (
        <div className="space-y-4">
          <h2 className="font-semibold">Delivery</h2>

          <select
            value={delivery.type}
            onChange={(e) =>
              setDelivery({ ...delivery, type: e.target.value })
            }
            className="border p-2 w-full"
          >
            <option value="home">Deliver to my address (Dar)</option>
            <option value="pickup">Pickup (store)</option>
          </select>

          {delivery.type === "home" && (
            <input
              type="text"
              placeholder="Delivery address"
              className="border p-2 w-full"
              value={delivery.address}
              onChange={(e) =>
                setDelivery({ ...delivery, address: e.target.value })
              }
            />
          )}
          <input
            type="text"
            placeholder="Contact phone"
            className="border p-2 w-full"
            value={delivery.contactPhone}
            onChange={(e) =>
              setDelivery({ ...delivery, contactPhone: e.target.value })
            }
          />

          <button
            onClick={next}
            disabled={!canContinueDelivery}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* ================= PAYMENT ================= */}
      {STEPS[step] === "payment" && (
        <div className="space-y-4">
          <h2 className="font-semibold">Payment</h2>

          <select
            value={payment.method}
            onChange={(e) =>
              setPayment({ method: e.target.value })
            }
            className="border p-2 w-full"
          >
            <option value="cash">Cash on Delivery</option>
            <option value="mobile_money">Mobile Money (soon)</option>
          </select>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={back} className="btn-secondary">
              Back
            </button>
            <button onClick={next} className="btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ================= REVIEW ================= */}
      {STEPS[step] === "review" && (
        <div className="space-y-4">
          <h2 className="font-semibold">Order Summary</h2>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm"
            >
              <span>
                {item.name} × {item.qty}
              </span>
              <span>{item.price * item.qty} TZS</span>
            </div>
          ))}

          <hr />

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{subtotal} TZS</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryFee} TZS</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{total} TZS</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={back} className="btn-secondary">
              Back
            </button>
            <button onClick={placeOrder} className="btn-primary">
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
