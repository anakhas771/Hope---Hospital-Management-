// src/pages/ManageDepartments.jsx
import React, { useState, useEffect } from "react";
import { adminFetch, adminFetchForm } from "../lib/api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [name, setName] = useState("");

  const fetchDepartments = async () => {
    try {
      const data = await adminFetch("/departments/");
      setDepartments(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchDepartments().finally(() => setLoading(false));
  }, []);

  const resetFields = () => {
    setName("");
    setCurrent(null);
  };

  const handleAddEdit = async () => {
    try {
      if (current) {
        await adminFetchForm(`/departments/${current.id}/`, "PUT", new FormData([["name", name]]));
      } else {
        await adminFetchForm("/departments/", "POST", new FormData([["name", name]]));
      }
      setModalOpen(false);
      resetFields();
      fetchDepartments();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await adminFetch(`/departments/${current.id}/`, "DELETE");
      setConfirmOpen(false);
      resetFields();
      fetchDepartments();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Departments</h1>
      <button
        className="mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded"
        onClick={() => setModalOpen(true)}
      >
        + Add Department
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-2 px-4">{d.name}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-400"
                    onClick={() => {
                      setCurrent(d);
                      setName(d.name);
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
        title={current ? "Edit Department" : "Add Department"}
      >
        <input
          type="text"
          placeholder="Department Name"
          className="w-full p-2 rounded bg-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleAddEdit}
          className="mt-4 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded"
        >
          {current ? "Update Department" : "Add Department"}
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