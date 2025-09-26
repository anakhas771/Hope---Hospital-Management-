// src/pages/ManageDoctors.jsx
import React, { useState, useEffect } from "react";
import { adminFetch, adminFetchForm } from "../lib/api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deptId, setDeptId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [profile, setProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("personal");

  const fetchDoctors = async () => {
    try {
      const data = await adminFetch("/doctors/");
      setDoctors(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await adminFetch("/departments/");
      setDepartments(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    Promise.all([fetchDoctors(), fetchDepartments()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const resetFields = () => {
    setName("");
    setEmail("");
    setDeptId("");
    setSpecialization("");
    setEducation("");
    setExperience("");
    setAvailability("");
    setProfile(null);
    setActiveTab("personal");
    setCurrent(null);
  };

  const handleAddEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("department", deptId);
      formData.append("specialization", specialization);
      formData.append("education", education);
      formData.append("experience", experience);
      formData.append("availability", availability);
      if (profile) formData.append("profile_image", profile);

      if (current) {
        await adminFetchForm(`/doctors/${current.id}/`, "PUT", formData);
      } else {
        await adminFetchForm("/doctors/", "POST", formData);
      }

      setModalOpen(false);
      resetFields();
      fetchDoctors();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/doctors/${current.id}/`, "DELETE");
      setConfirmOpen(false);
      resetFields();
      fetchDoctors();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Doctors</h1>
      <button
        className="mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded"
        onClick={() => setModalOpen(true)}
      >
        + Add Doctor
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Department</th>
              <th className="py-2 px-4">Specialization</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-2 px-4">{d.name}</td>
                <td className="py-2 px-4">{d.email}</td>
                <td className="py-2 px-4">{d.department_name}</td>
                <td className="py-2 px-4">{d.specialization}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-400"
                    onClick={() => {
                      setCurrent(d);
                      setName(d.name);
                      setEmail(d.email);
                      setDeptId(d.department);
                      setSpecialization(d.specialization);
                      setEducation(d.education);
                      setExperience(d.experience);
                      setAvailability(d.availability);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                    onClick={() => {
                      setCurrent(d);
                      setConfirmOpen(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetFields();
        }}
        title={current ? "Edit Doctor" : "Add Doctor"}
      >
        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-700">
          <button
            className={`px-4 py-2 -mb-px ${activeTab === "personal" ? "border-b-2 border-cyan-500 font-semibold" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </button>
          <button
            className={`px-4 py-2 -mb-px ${activeTab === "professional" ? "border-b-2 border-cyan-500 font-semibold" : ""}`}
            onClick={() => setActiveTab("professional")}
          >
            Professional Info
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {activeTab === "personal" && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 rounded bg-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 rounded bg-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="file"
                className="w-full"
                onChange={(e) => setProfile(e.target.files[0])}
              />
            </>
          )}

          {activeTab === "professional" && (
            <>
              <select
                className="w-full p-2 rounded bg-gray-800"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Specialization"
                className="w-full p-2 rounded bg-gray-800"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
              <input
                type="text"
                placeholder="Education"
                className="w-full p-2 rounded bg-gray-800"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
              <input
                type="text"
                placeholder="Experience"
                className="w-full p-2 rounded bg-gray-800"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
              <input
                type="text"
                placeholder="Availability"
                className="w-full p-2 rounded bg-gray-800"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </>
          )}
        </div>

        <button
          onClick={handleAddEdit}
          className="mt-4 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded"
        >
          {current ? "Update Doctor" : "Add Doctor"}
        </button>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${current?.name}"?`}
      />
    </div>
  );
}