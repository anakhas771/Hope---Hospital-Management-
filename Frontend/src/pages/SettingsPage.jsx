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
    <div className="min-h-screen px-4 md:px-12 pt-12 text-white bg-transparent flex justify-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl gap-8">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-full border-4 border-white/20 shadow-lg"
            />
            <label className="absolute right-0 bottom-0 bg-blue-500 p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition">
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <span className="text-sm md:text-lg">📤</span>
            </label>
          </div>
          <button
            onClick={clearProfileImage}
            className="mt-4 px-4 py-2 rounded-xl bg-red-500 text-sm hover:bg-red-600 transition"
          >
            Clear Image
          </button>
        </div>

        {/* User Info Form */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
                className="mt-2 p-2 md:p-3 rounded-xl bg-white/5 border border-white/20 placeholder-gray-400 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder={`Enter ${field.label}`}
              />
            </label>
          ))}

          {/* Save Button spanning full width */}
          <div className="col-span-full flex justify-end mt-2 md:mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
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
