import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingCart,
} from "react-icons/fi";
import { useCart } from "../hooks/useCart";

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();

  /**
   * TOTALS (derived state)
   */
  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    );

    const delivery = subtotal > 150000 ? 0 : 5000;
    const total = subtotal + delivery;

    return { subtotal, delivery, total };
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
        <FiShoppingCart className="mx-auto text-5xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">
          Cart yako iko tupu
        </h2>
        <p className="text-gray-500 mt-2">
          Anza kuchagua pochi nzuri 🌸
        </p>
        <Link
          to="/shop"
          className="inline-block mt-6 bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition"
        >
          Rudi Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 grid lg:grid-cols-3 gap-8 md:gap-12">
      {/* ================= ITEMS ================= */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Cart Yako
        </h1>

        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 bg-white rounded-2xl p-4 md:p-5 shadow"
          >
            <img
              src={item.image}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-bag.svg";
              }}
              className="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-xl"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {item.name}
              </h3>

              {item.variant && (
                <p className="text-sm text-gray-500">
                  {item.variant.name}
                </p>
              )}

              <p className="text-pink-600 font-bold mt-1">
                TZS {item.price.toLocaleString()}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                {/* Qty */}
                <div className="flex items-center border rounded-full">
                  <button
                    onClick={() =>
                      updateQty(item.id, item.qty - 1)
                    }
                    className="p-2"
                  >
                    <FiMinus />
                  </button>

                  <span className="px-4">
                    {item.qty}
                  </span>

                  <button
                    onClick={() =>
                      updateQty(item.id, item.qty + 1)
                    }
                    className="p-2"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="bg-gray-50 rounded-3xl p-5 md:p-8 h-fit">
        <h2 className="text-xl font-semibold mb-6">
          Order Summary
        </h2>

        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              TZS {totals.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>
            <span>
              {totals.delivery === 0
                ? "FREE"
                : `TZS ${totals.delivery.toLocaleString()}`}
            </span>
          </div>

          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-pink-600">
              TZS {totals.total.toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="block mt-8 text-center bg-pink-500 text-white py-4 rounded-full font-semibold hover:bg-pink-600 transition"
        >
          Endelea Checkout
        </Link>

        <button
          onClick={clearCart}
          className="block w-full mt-4 text-sm text-gray-500 hover:text-red-500"
        >
          Clear cart
        </button>
      </div>
    </div>
  );
}
