// src/components/Sidebar.jsx
import React from "react";
import { Home, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const menu = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Appointments", icon: <Calendar size={18} />, path: "/appointments" },
    { name: "Doctors", icon: <User size={18} />, path: "/doctors" },
  ];

  return (
    <div className="w-64 h-full bg-white/10 backdrop-blur-lg p-5 flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-bold mb-4">MyHealth</h1>
      {menu.map((item) => (
        <button
          key={item.name}
          className="flex items-center gap-3 p-2 rounded hover:bg-white/20 transition-colors"
          onClick={() => navigate(item.path)}
        >
          {item.icon} {item.name}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;