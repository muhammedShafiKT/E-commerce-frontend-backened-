import { useEffect, useState } from "react";
import axiosInstance from "../../../api/apiInstance";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, totalRevenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState("30");
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/admin/stats").then((res) => {
      setStats(res.data);
    });
  }, []);

  useEffect(() => {
    axiosInstance.get(`/admin/revenue?range=${range}`).then((res) => {
      setChartData(res.data);
    });
  }, [range]);

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="border-b border-[#c8a97e]/10 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif italic text-white tracking-wide">Executive Overview</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a97e]/50 mt-2">Real-time Performance Metrics</p>
        </div>

        <button
          onClick={() => navigate("/admin/settings")}
          className="text-[9px] uppercase tracking-[0.3em] text-[#c8a97e]/40 hover:text-[#c8a97e] border border-[#c8a97e]/10 hover:border-[#c8a97e]/30 px-5 py-3 transition-all duration-500"
        >
          Change Password
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Patronage"  value={stats.users}                                sub="Registered Users" />
        <StatCard label="Acquisitions"     value={stats.orders}                               sub="Total Orders" />
        <StatCard label="The Collection"   value={stats.products}                             sub="Active Products" />
        <StatCard label="Gross Revenue"    value={`₹${stats.totalRevenue.toLocaleString()}`}  sub="Net Earnings" highlight />
      </div>

      {/* Chart */}
      <div className="bg-[#1a140e]/40 border border-[#c8a97e]/10 p-8 rounded-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-serif italic text-white">Revenue Stream</h2>
            <p className="text-[9px] uppercase tracking-widest text-[#c8a97e]/40 mt-1">Monetary Growth Flow</p>
          </div>

          <div className="flex gap-6">
            {["30", "7"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-[10px] uppercase tracking-[0.3em] pb-1 border-b transition-all duration-500 ${
                  range === r
                    ? "border-[#c8a97e] text-[#c8a97e]"
                    : "border-transparent text-white/20 hover:text-white"
                }`}
              >
                {r === "30" ? "Monthly" : "Weekly"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c8a97e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c8a97e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 169, 126, 0.05)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(200, 169, 126, 0.3)", fontSize: 9 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(200, 169, 126, 0.3)", fontSize: 9 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#c8a97e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, sub, highlight = false }) {
  return (
    <div className={`p-8 border rounded-sm transition-all duration-500 hover:bg-[#c8a97e]/5 ${highlight ? "border-[#c8a97e]/40 bg-[#c8a97e]/5" : "border-[#c8a97e]/10 bg-transparent"}`}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#c8a97e]/60">{label}</p>
      <p className="text-3xl font-serif text-white mt-4 tracking-tight italic">{value}</p>
      <div className="h-[1px] w-8 bg-[#c8a97e]/20 my-4"></div>
      <p className="text-[9px] uppercase tracking-widest text-white/20 font-light">{sub}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f0a07] border border-[#c8a97e]/30 p-4 shadow-2xl backdrop-blur-md">
        <p className="text-[9px] uppercase tracking-widest text-[#c8a97e]/40 mb-1">{payload[0].payload.date}</p>
        <p className="text-white font-serif italic text-lg tracking-wide">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};