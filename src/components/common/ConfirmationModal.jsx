// src/components/common/ConfirmationModal.jsx

import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  imageSrc,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal Content */}
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm text-center p-6">
        {/* Gambar Kustom di Atas */}
        {imageSrc && (
          <div className="flex justify-center mb-4">
            <img
              src={imageSrc}
              alt="confirmation icon"
              className="h-16 w-auto"
            />
          </div>
        )}

        {/* Judul & Children (Isi Pesan) */}
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-sm text-gray-500 mb-6">{children}</div>

        {/* Tombol Aksi */}
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            className="btn bg-brand-gold text-white w-full"
          >
            {confirmText}
          </button>
          <button onClick={onClose} className="btn btn-ghost w-full">
            Change details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
