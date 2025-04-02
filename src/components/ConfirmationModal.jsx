import React from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-400 px-4 py-2 rounded-md text-white"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 px-4 py-2 rounded-md text-white"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
