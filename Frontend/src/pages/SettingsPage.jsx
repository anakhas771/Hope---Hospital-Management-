import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
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
    <div className="min-h-screen px-4 md:px-24 pt-24 pb-12 text-white bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-1">Settings</h2>
        <p className="text-gray-300 text-center mb-6">Update your profile and preferences</p>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-36 h-36 object-cover rounded-full border-4 border-white/20 shadow-xl"
            />
            <label className="absolute right-0 bottom-0 bg-blue-500 p-3 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition">
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <span className="text-lg">📤</span>
            </label>
          </div>
          <button
            onClick={clearProfileImage}
            className="mt-4 px-5 py-2 rounded-xl bg-red-500 text-sm hover:bg-red-600 transition"
          >
            Clear Image
          </button>
        </div>

        {/* User Info Form */}
        <div className="flex flex-col gap-5">
          {[
            { label: "First Name", key: "first_name" },
            { label: "Last Name", key: "last_name" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Address", key: "address" },
            { label: "City", key: "city" },
            { label: "Country", key: "country" },
          ].map((field) => (
            <label key={field.key} className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">{field.label}</span>
              <input
                value={user[field.key]}
                onChange={(e) =>
                  setUser({ ...user, [field.key]: e.target.value })
                }
                className="mt-2 p-3 rounded-2xl bg-white/5 border border-white/20 placeholder-gray-400 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder={`Enter ${field.label}`}
              />
            </label>
          ))}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="mt-6 px-6 py-3 rounded-2xl bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 transition"
          >
            Save & Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
