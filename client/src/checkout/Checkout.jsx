import { useState } from "react";
import { FiShoppingCart, FiCreditCard, FiTruck, FiCheckCircle } from "react-icons/fi";
import useToast from "../hooks/useToast";

export default function Checkout({ cartItems, onPlaceOrder }) {
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const toast = useToast();

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handlePlaceOrder = () => {
    if (!shipping.name || !shipping.email || !shipping.address) {
      toast.error("Please fill shipping info");
      return;
    }

    const orderData = {
      items: cartItems,
      shipping,
      paymentMethod,
      totalAmount,
    };
    onPlaceOrder(orderData);
    setStep(4); // success
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Checkout
      </h2>

      {/* STEPS */}
      <div className="flex justify-between mb-6">
        <div className={`flex-1 p-2 rounded-lg text-center font-medium ${step >= 1 ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-500"}`}>Cart</div>
        <div className={`flex-1 p-2 rounded-lg text-center font-medium ${step >= 2 ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-500"}`}>Shipping</div>
        <div className={`flex-1 p-2 rounded-lg text-center font-medium ${step >= 3 ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-500"}`}>Payment</div>
        <div className={`flex-1 p-2 rounded-lg text-center font-medium ${step === 4 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>Success</div>
      </div>

      {/* STEP CONTENT */}
      {step === 1 && (
        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex justify-between p-4 bg-pink-50 rounded-lg items-center">
                <div className="font-medium">{item.name} × {item.quantity}</div>
                <div className="font-semibold">TZS {item.price * item.quantity}</div>
              </div>
            ))
          )}
          <div className="flex justify-between mt-4 font-bold text-gray-800">
            <span>Total:</span>
            <span>TZS {totalAmount}</span>
          </div>
          <button onClick={handleNext} className="w-full py-3 mt-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
            <FiTruck className="inline mr-2" /> Proceed to Shipping
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          <input type="email" name="email" placeholder="Email" value={shipping.email} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          <input type="text" name="address" placeholder="Address" value={shipping.address} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          <input type="text" name="city" placeholder="City" value={shipping.city} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          <input type="tel" name="phone" placeholder="Phone" value={shipping.phone} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <div className="flex justify-between mt-4">
            <button onClick={handleBack} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Back</button>
            <button onClick={handleNext} className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="font-medium mb-2">Select Payment Method</p>
          <div className="flex gap-4">
            <button onClick={() => setPaymentMethod("card")} className={`flex-1 p-4 rounded-lg border ${paymentMethod==="card"?"border-pink-500 bg-pink-50":"border-gray-300 bg-white"}`}> <FiCreditCard className="inline mr-2" /> Card</button>
            <button onClick={() => setPaymentMethod("mobile")} className={`flex-1 p-4 rounded-lg border ${paymentMethod==="mobile"?"border-pink-500 bg-pink-50":"border-gray-300 bg-white"}`}>Mobile Money</button>
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={handleBack} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Back</button>
            <button onClick={handlePlaceOrder} className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">Place Order</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center space-y-4">
          <FiCheckCircle className="mx-auto text-green-500 text-6xl" />
          <h3 className="text-xl font-bold text-gray-800">Order Placed Successfully!</h3>
          <p className="text-gray-500">Thank you for your purchase 🌸</p>
        </div>
      )}
    </div>
  );
}
