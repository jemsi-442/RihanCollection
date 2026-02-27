import { useState } from "react";
import { motion } from "framer-motion";
import api from "../utils/axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // register user
      const res = await api.post("/auth/register", { name, email, password });

      // server inarudisha: _id, name, email, role, token
      const { _id, name: n, email: em, role, token } = res.data;

      // auto-login
      login({
        user: { _id, name: n, email: em, role },
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
      setError(err.response?.data?.message || "Email tayari imesajiliwa 💔");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-200 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 md:p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-primary mb-2">Jiunge Nasi 🌸</h2>
        <p className="text-center text-gray-500 mb-6">Pata pochi za kipekee & maridadi</p>

        {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Jina lako"
            className="input"
            value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" placeholder="Email"
            className="input"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password"
            className="input"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90">
            Register 💖
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Tayari una account? <Link to="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
