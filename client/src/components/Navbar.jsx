import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiShoppingBag, FiX } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl md:text-2xl font-bold text-primary">
          Rihan-Collection
        </Link>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition">
            Home
          </Link>

          <Link to="/shop" className="text-gray-700 hover:text-primary transition">
            Shop
          </Link>

          <Link
            to="/cart"
            className="text-gray-700 hover:text-primary transition flex items-center gap-1"
          >
            <FiShoppingBag /> Cart
            {cartCount > 0 && (
              <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className="text-primary font-medium">
              Admin
            </Link>
          )}

          {user?.role === "rider" && (
            <Link to="/rider" className="text-primary font-medium">
              Rider
            </Link>
          )}

          {!user ? (
            <Link to="/login" className="btn-soft">
              Login
            </Link>
          ) : (
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="btn-soft"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link onClick={closeMenu} to="/" className="block text-gray-700">
            Home
          </Link>
          <Link onClick={closeMenu} to="/shop" className="block text-gray-700">
            Shop
          </Link>
          <Link onClick={closeMenu} to="/cart" className="flex items-center gap-2 text-gray-700">
            <FiShoppingBag />
            Cart
            {cartCount > 0 && (
              <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>
          {user?.role === "admin" && (
            <Link onClick={closeMenu} to="/admin" className="block text-primary font-medium">
              Admin
            </Link>
          )}
          {user?.role === "rider" && (
            <Link onClick={closeMenu} to="/rider" className="block text-primary font-medium">
              Rider
            </Link>
          )}
          {!user ? (
            <Link onClick={closeMenu} to="/login" className="block btn-soft text-center">
              Login
            </Link>
          ) : (
            <button
              onClick={() => {
                closeMenu();
                logout();
                window.location.href = "/";
              }}
              className="w-full btn-soft"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
