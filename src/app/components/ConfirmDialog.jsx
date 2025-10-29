"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-transparent backdrop-blur-md z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              className="bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#2f2f2f] max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-lg">
                    <AlertTriangle className="text-red-500" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#2f2f2f] text-gray-200 py-2.5 px-4 rounded-lg hover:bg-[#3f3f3f] transition duration-200 font-medium"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-2.5 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 font-medium"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
};

export default ConfirmDialog;
