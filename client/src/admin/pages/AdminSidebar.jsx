import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

/**
 * Sidebar navigation config
 * (Easy to extend / role-based later)
 */
const navItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: FiHome,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: FiPackage,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: FiShoppingBag,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: FiUsers,
  },
];

export default function AdminSidebar({ className = "" }) {
  const { logout } = useAuth();

  return (
    <aside className={`w-64 bg-white border-r min-h-screen flex flex-col ${className}`}>
      
      {/* BRAND */}
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold text-rose-500">
          Ramla<span className="text-gray-800">Admin</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Ladies Fashion Control
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-rose-50 text-rose-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }
                `
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-4 py-4 border-t">
        <button
          className="
            w-full flex items-center gap-3 px-4 py-3
            rounded-lg text-sm font-medium
            text-gray-600 hover:bg-gray-100
            transition
          "
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
