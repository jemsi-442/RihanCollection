import { Suspense, lazy, useEffect, useState } from "react";
import axios from "../../utils/axios";
import {
  FaMoneyBillWave,
  FaShoppingBag,
  FaTruck,
  FaUsers,
} from "react-icons/fa";

import { extractOne } from "../../utils/apiShape";
import { useToast } from "../../hooks/useToast";
import { TableSkeleton } from "../../components/Skeleton";

const REFRESH_INTERVAL = 20000;

const DashboardCharts = lazy(() => import("../components/DashboardCharts"));

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get("/admin/dashboard");
      const payload = extractOne(data);
      setStats(payload);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return <TableSkeleton rows={5} />;
  }

  const pieData = (stats.orderStatusStats || []).map((item) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>

      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <KPI
          label="Revenue Today"
          value={`Tsh ${(stats.kpis?.monthlyRevenue || 0).toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-green-600"
        />
        <KPI
          label="Total Orders"
          value={stats.kpis?.totalOrders || 0}
          icon={FaShoppingBag}
          color="bg-blue-600"
        />
        <KPI
          label="Pending Orders"
          value={stats.kpis?.pendingOrders || 0}
          icon={FaTruck}
          color="bg-purple-600"
        />
        <KPI
          label="Total Users"
          value={stats.kpis?.totalUsers || 0}
          icon={FaUsers}
          color="bg-orange-500"
        />
      </div>

      <Suspense fallback={<TableSkeleton rows={3} />}>
        <DashboardCharts revenueByDay={stats.revenueByDay || []} pieData={pieData} />
      </Suspense>
    </div>
  );
}

/* ================= COMPONENT ================= */

const KPI = ({ label, value, icon: Icon, color }) => (
  <div className={`rounded-xl p-4 text-white ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <Icon size={26} />
    </div>
  </div>
);
