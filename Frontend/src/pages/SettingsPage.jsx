import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { theme, toggle } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profile_image") || null
  );

  // Load stored user data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Save data and redirect
  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    if (profileImage) localStorage.setItem("profile_image", profileImage);
    toast.success("Profile saved locally");
    navigate("/dashboard"); // Redirect to dashboard
  };

  // Clear profile image
  const clearProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem("profile_image");
    toast.success("Profile image cleared");
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      toast.success("Profile image updated");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen px-4 md:px-24 pt-24 pb-12 text-white">
      <div className="max-w-3xl mx-auto bg-white/6 backdrop-blur-2xl border border-white/8 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-300 mt-1">Update your profile and preferences</p>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-white/20 shadow-lg"
            />
            <label className="absolute right-0 bottom-0 bg-blue-500 p-2 rounded-full cursor-pointer shadow-md">
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <span className="text-xs">📤</span>
            </label>
          </div>
          <button
            onClick={clearProfileImage}
            className="mt-3 px-4 py-2 rounded-xl bg-red-500 text-sm"
          >
            Clear Image
          </button>
        </div>

        {/* User Info Form */}
        <div className="mt-6 grid grid-cols-1 gap-4">

          {/* Name Fields */}
          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">First Name</span>
            <input
              value={user.first_name}
              onChange={(e) => setUser({ ...user, first_name: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Last Name</span>
            <input
              value={user.last_name}
              onChange={(e) => setUser({ ...user, last_name: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          {/* Email & Phone */}
          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Email</span>
            <input
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Phone</span>
            <input
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          {/* Address Fields */}
          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Address</span>
            <input
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">City</span>
            <input
              value={user.city}
              onChange={(e) => setUser({ ...user, city: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Country</span>
            <input
              value={user.country}
              onChange={(e) => setUser({ ...user, country: e.target.value })}
              className="mt-2 p-3 rounded-xl bg-white/4 border border-white/8"
            />
          </label>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="text-sm font-semibold">Theme</div>
              <div className="text-xs text-gray-400">Current: {theme}</div>
            </div>
            <button onClick={toggle} className="px-4 py-2 rounded-xl bg-white/6">Toggle Theme</button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-blue-500"
            >
              Save & Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
