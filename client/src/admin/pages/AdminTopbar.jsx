import { FiBell, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * AdminTopbar
 * - Global admin actions
 * - User identity
 * - Notifications placeholder
 */
export default function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      
      {/* LEFT: Title */}
      <div className="flex items-center gap-3">
        <span className="text-base md:text-lg font-semibold text-gray-800">
          Admin Dashboard
        </span>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Notifications (future realtime orders) */}
        <button
          className="relative text-gray-600 hover:text-gray-900 transition"
          aria-label="Notifications"
        >
          <FiBell size={20} />

          {/* Badge example */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User info */}
        <div className="hidden sm:flex items-center gap-2 text-gray-700">
          <FiUser />
          <span className="text-sm font-medium">
            {user?.name || "Admin"}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition"
        >
          <FiLogOut />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
