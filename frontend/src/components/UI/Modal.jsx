import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ onClose, title, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 animate-slide-up border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
