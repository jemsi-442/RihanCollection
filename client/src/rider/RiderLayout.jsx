import React from "react";
import { Link, Outlet } from "react-router-dom";

/**
 * RiderLayout
 * - Wrappa rider dashboard na sidebar
 * - Children (Outlet) ni rider pages kama orders, dashboard
 */
export default function RiderLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Rider Panel</h2>
        <nav className="flex flex-col gap-3">
          <Link to="/rider" className="hover:text-primary">
            Dashboard
          </Link>
          <Link to="/rider/orders" className="hover:text-primary">
            Orders
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
