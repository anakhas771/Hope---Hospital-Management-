// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  UserIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/solid";

const CARD_GRADIENTS = [
  "from-cyan-500 via-cyan-400 to-cyan-300",
  "from-purple-500 via-purple-400 to-purple-300",
  "from-teal-500 via-teal-400 to-teal-300",
  "from-pink-500 via-pink-400 to-pink-300"
];

const PIE_COLORS = [
  ["#06b6d4", "#0ea5e9"],
  ["#84cc16", "#bef264"],
  ["#facc15", "#fde047"],
  ["#f97316", "#fb923c"],
  ["#ec4899", "#f472b6"],
  ["#a78bfa", "#c4b5fd"]
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [activePieIndex, setActivePieIndex] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminFetch("/admin/stats/");
        setStats(data);
      } catch (e) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <FullScreenMessage text="Loading…" color="text-gray-300" />;
  if (err) return <FullScreenMessage text={err} color="text-red-400" />;
  if (!stats) return <FullScreenMessage text="No data available" color="text-gray-300" />;

  const deptData = stats.appointments_by_department?.map(d => ({ name: d.name, value: d.appts })) || [];
  const revenueData = stats.last_12_months_revenue || [];
  const filteredAppointments = stats.recent_appointments?.filter(r =>
    r["patient__email"].toLowerCase().includes(search.toLowerCase()) ||
    r["doctor__name"].toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-950 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPI title="Users" value={stats.total_users || 0} icon={UserIcon} gradient={CARD_GRADIENTS[0]} />
        <KPI title="Doctors" value={stats.total_doctors || 0} icon={UserGroupIcon} gradient={CARD_GRADIENTS[1]} />
        <KPI title="Patients" value={stats.total_patients || 0} icon={ClipboardDocumentCheckIcon} gradient={CARD_GRADIENTS[2]} />
        <KPI title="Appointments" value={stats.total_appointments || 0} icon={CalendarIcon} gradient={CARD_GRADIENTS[3]} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <Card title="Revenue" className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-gray-800">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0dd9fa" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#f1f5f9" />
                <YAxis stroke="#f1f5f9" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: 8, color: "#f1f5f9" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#revenueGradient)"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: "#f1f5f9" }}
                  activeDot={{ r: 10 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Last 30 Days */}
        <Card title="Revenue (Last 30 Days)" className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-gray-800">
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-4xl font-semibold text-white">
              <CountUp end={Number(stats.revenue_30d || 0)} duration={2} separator="," prefix="$" />
            </div>
          </div>
        </Card>

        {/* Appointments by Department */}
        <Card title="Appointments by Department" className="bg-gray-800">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {PIE_COLORS.map((c, idx) => (
                    <linearGradient key={idx} id={`grad${idx}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={c[0]} />
                      <stop offset="100%" stopColor={c[1]} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={deptData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={activePieIndex !== null ? 120 : 100}
                  innerRadius={40}
                  paddingAngle={3}
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const isActive = index === activePieIndex;
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#ffffff"
                        fontWeight={isActive ? "bold" : "normal"}
                        fontSize={isActive ? 14 : 12}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        stroke="#000"
                        strokeWidth={0.3}
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {deptData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#grad${index % PIE_COLORS.length})`}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: 8, color: "#f1f5f9" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card title="Recent Appointments" className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-gray-900">
        <div className="mb-4 flex justify-end items-center space-x-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-300" />
          <input
            type="text"
            placeholder="Search by doctor/patient..."
            className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200 shadow hover:shadow-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-300 border-b border-gray-600">
                <th className="py-3 pr-6">Doctor</th>
                <th className="py-3 pr-6">Patient</th>
                <th className="py-3 pr-6">Date</th>
                <th className="py-3 pr-6">Status</th>
                <th className="py-3 pr-6">Amount</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredAppointments.map((r, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors rounded-md"
                  >
                    <td className="py-3 pr-6 text-white">{r["doctor__name"]}</td>
                    <td className="py-3 pr-6 text-gray-300">{r["patient__email"]}</td>
                    <td className="py-3 pr-6 text-gray-400">{new Date(r.date_time).toLocaleString()}</td>
                    <td className="py-3 pr-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "paid" ? "bg-green-600 text-green-100 shadow" :
                        r.status === "pending" ? "bg-yellow-500 text-yellow-100 shadow" :
                        "bg-red-600 text-red-100 shadow"
                      }`}>
                        {r.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-gray-300">
                      <CountUp end={Number(r.amount || 0)} duration={1} separator="," prefix="$" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ------------------- Reusable Components -------------------

function KPI({ title, value, icon: Icon, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}
      className={`rounded-2xl p-5 flex items-center space-x-4 bg-gradient-to-r ${gradient} text-white shadow-md transition-all duration-300`}
    >
      <div className="p-3 bg-white/20 rounded-full">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-sm opacity-80">{title}</div>
        <div className="text-2xl font-semibold mt-1">
          <CountUp end={Number(value)} duration={2} separator="," />
        </div>
      </div>
    </motion.div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl p-6 bg-white/5 backdrop-blur text-white shadow-md mb-4 transition-all duration-300 ${className}`}>
      <div className="font-medium mb-3 text-lg opacity-90">{title}</div>
      {children}
    </div>
  );
}

function FullScreenMessage({ text, color }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className={`text-xl ${color}`}>{text}</p>
    </div>
  );
}