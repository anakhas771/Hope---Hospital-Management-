// src/components/AdminLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/admin", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "Departments", path: "/admin/departments", icon: <BuildingStorefrontIcon className="w-5 h-5" /> },
    { name: "Doctors", path: "/admin/doctors", icon: <UserGroupIcon className="w-5 h-5" /> },
    { name: "Appointments", path: "/admin/appointments", icon: <CalendarIcon className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    navigate("/admin-login");
  };

  const SidebarContent = (
    <div className="flex flex-col h-full text-white">
      {/* Logo & Collapse */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        {!collapsed && <div className="text-2xl font-bold">Admin Panel</div>}
        <button
          className="p-2 rounded hover:bg-gray-700 transition-all duration-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 flex flex-col p-2 space-y-1 overflow-auto">
        {menu.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-cyan-600 ${
                active ? "bg-cyan-600" : ""
              }`}
            >
              {item.icon}
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen  bg-gray-950 text-white overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-gray-950 shadow-lg transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Sidebar Mobile */}
      <div className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}></div>
        <div className="relative w-64 h-full bg-gray-950 shadow-lg">
          {SidebarContent}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col   ">
        {/* Topbar */}
        <header className="h-22 bg-gray-950 border-b border-gray-700 flex items-center justify-between px-6 shadow-sm">
          {/* Left: Hamburger Menu */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-700 transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Right: Admin Profile & Logout */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-sm font-medium">Admin</div>
            <img
              src="./admin.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-cyan-500"
            />
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-red-600 transition-all duration-200"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}