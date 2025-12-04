// src/pages/SettingsPage.jsx
import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { theme, toggle } = useContext(ThemeContext);
  const [user, setUser] = useState({ first_name: "", last_name: "", email: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    toast.success("Profile saved locally");
  };

  return (
    <div className="min-h-screen px-4 md:px-24 pt-24 pb-12 text-white">
      <div className="max-w-3xl mx-auto bg-white/6 backdrop-blur-2xl border border-white/8 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-300 mt-1">Update your profile and preferences</p>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">First Name</span>
            <input value={user.first_name} onChange={(e)=>setUser({...user, first_name:e.target.value})} className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Last Name</span>
            <input value={user.last_name} onChange={(e)=>setUser({...user, last_name:e.target.value})} className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Email</span>
            <input value={user.email} onChange={(e)=>setUser({...user, email:e.target.value})} className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8" />
          </label>

          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="text-sm font-semibold">Theme</div>
              <div className="text-xs text-gray-400">Current: {theme}</div>
            </div>
            <button onClick={toggle} className="px-4 py-2 rounded-xl bg-white/6">Toggle Theme</button>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-500">Save</button>
            <button onClick={()=>{ localStorage.removeItem("profile_image"); toast.success("Profile image cleared"); }} className="px-4 py-2 rounded-xl bg-red-500">Clear Profile Image</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
