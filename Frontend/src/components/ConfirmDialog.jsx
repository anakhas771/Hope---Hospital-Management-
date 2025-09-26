import React from "react";

export default function ConfirmDialog({ open, onClose, onConfirm, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 text-white rounded-xl shadow-lg w-full max-w-md p-6">
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}