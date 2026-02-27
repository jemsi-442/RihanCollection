import { useState } from "react";
import { motion } from "framer-motion";
import api from "../utils/axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      // server inarudisha: _id, name, email, role, token
      const { _id, name, email: em, role, token } = res.data;

      login({
        user: { _id, name, email: em, role },
        token,
      });

      // redirect based on role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "rider":
          navigate("/rider");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email au password sio sahihi 💔");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 md:p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-primary mb-2">Karibu Tena 💕</h2>
        <p className="text-center text-gray-500 mb-6">Ingia uone pochi mpya za kupendeza</p>

        {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email"
            className="input"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password"
            className="input"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90">
            Login 🌸
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Huna account? <Link to="/register" className="text-primary font-semibold">Jisajili</Link>
        </p>
      </motion.div>
    </div>
  );
}
