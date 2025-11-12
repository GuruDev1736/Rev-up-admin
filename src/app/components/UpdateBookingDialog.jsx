"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, CheckCircle, Calendar, Clock, AlertCircle, DollarSign } from "lucide-react";
import { updateBooking, activateBooking, completeBooking, cancelBooking, refundBooking } from "@/services/api/bookingsService";

const UpdateBookingDialog = ({ isOpen, onClose, booking, onSuccess }) => {
  const [action, setAction] = useState(""); // 'activate', 'complete', 'cancel', 'update_dates'
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize date/time values when booking changes
  useEffect(() => {
    if (booking) {
      setAction("");
      setCancellationReason("");
      
      // Convert "2025-11-12 17:55" format to datetime-local format "2025-11-12T17:55"
      if (booking.startDateTime) {
        const startFormatted = booking.startDateTime.replace(" ", "T");
        setStartDateTime(startFormatted);
      }
      if (booking.endDateTime) {
        const endFormatted = booking.endDateTime.replace(" ", "T");
        setEndDateTime(endFormatted);
      }
    }
  }, [booking]);

  // Get available actions based on current status
  const getAvailableActions = () => {
    const status = booking?.bookingStatus;
    const paymentStatus = booking?.paymentStatus;
    const actions = [];

    if (status === "PENDING" || status === "CONFIRMED") {
      actions.push({ value: "activate", label: "Activate Booking", color: "green" });
    }
    
    if (status === "ACTIVE") {
      actions.push({ value: "complete", label: "Complete Booking", color: "blue" });
    }
    
    // Cancel available for all statuses except COMPLETED and CANCELLED
    if (status !== "COMPLETED" && status !== "CANCELLED") {
      actions.push({ value: "cancel", label: "Cancel Booking", color: "red" });
    }

    // Refund available only for CANCELLED bookings with PAID status (not already REFUNDED)
    if (status === "CANCELLED" && paymentStatus !== "REFUNDED") {
      actions.push({ value: "refund", label: "Process Refund", color: "purple" });
    }

    // Update dates available for PENDING, CONFIRMED, and ACTIVE (not CANCELLED or COMPLETED)
    if (status === "PENDING" || status === "CONFIRMED" || status === "ACTIVE") {
      actions.push({ value: "update_dates", label: "Update Dates/Times", color: "orange" });
    }

    return actions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (action) {
        case "activate":
          response = await activateBooking(booking.id);
          break;

        case "complete":
          response = await completeBooking(booking.id);
          break;

        case "cancel":
          if (!cancellationReason.trim()) {
            setError("Please provide a cancellation reason");
            setLoading(false);
            return;
          }
          response = await cancelBooking(booking.id, cancellationReason);
          break;

        case "refund":
          response = await refundBooking(booking.id);
          break;

        case "update_dates":
          // Convert datetime-local format back to "YYYY-MM-DD HH:mm"
          const startFormatted = startDateTime.replace("T", " ");
          const endFormatted = endDateTime.replace("T", " ");

          const bookingData = {
            startDateTime: startFormatted,
            endDateTime: endFormatted,
          };
          response = await updateBooking(booking.id, bookingData);
          break;

        default:
          setError("Please select an action");
          setLoading(false);
          return;
      }

      if (response.STS === "200") {
        onSuccess(response.MSG || "Booking updated successfully!");
        handleClose();
      } else {
        setError(response.MSG || "Failed to update booking");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(err.message || "An error occurred while updating booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !booking) return null;

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
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <CheckCircle className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Update Booking</h3>
                    <p className="text-sm text-gray-600 mt-1">Booking #{booking.id}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-red-600 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Booking Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bike:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {booking.bike?.bikeName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <span className={`text-sm font-semibold ${
                        booking.bookingStatus === "ACTIVE" ? "text-green-600" :
                        booking.bookingStatus === "COMPLETED" ? "text-blue-600" :
                        booking.bookingStatus === "CANCELLED" ? "text-red-600" :
                        booking.bookingStatus === "CONFIRMED" ? "text-purple-600" :
                        "text-yellow-600"
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`text-sm font-semibold ${
                        booking.paymentStatus === "PAID" ? "text-green-600" :
                        booking.paymentStatus === "REFUNDED" ? "text-purple-600" :
                        "text-yellow-600"
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Already Refunded Message */}
                {booking.bookingStatus === "CANCELLED" && booking.paymentStatus === "REFUNDED" && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Refund Processed</p>
                      <p className="text-xs text-purple-700 mt-1">
                        This booking has been cancelled and the refund has already been processed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Flow Information */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">Status Flow:</p>
                  <p className="text-xs text-blue-600">
                    PENDING → CONFIRMED → ACTIVE → COMPLETED
                  </p>
                </div>

                {getAvailableActions().length > 0 ? (
                  <div className="space-y-4">
                    {/* Action Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Action *
                      </label>
                      <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900"
                      >
                        <option value="">-- Select an action --</option>
                        {getAvailableActions().map((act) => (
                          <option key={act.value} value={act.value}>
                            {act.label}
                          </option>
                        ))}
                      </select>
                    </div>

                  {/* Conditional Fields Based on Action */}
                  {action === "refund" && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <DollarSign className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-medium text-purple-900 mb-1">
                            Process Refund
                          </p>
                          <p className="text-sm text-purple-700">
                            This will initiate a refund for the cancelled booking. The amount will be credited back to the customer's original payment method.
                          </p>
                          <p className="text-xs text-purple-600 mt-2">
                            Booking Amount: ₹{booking.totalAmount?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {action === "cancel" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Reason *
                      </label>
                      <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        required
                        rows={3}
                        placeholder="Enter reason for cancellation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {action === "update_dates" && (
                    <>
                      {/* Start Date & Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            Start Date & Time *
                          </div>
                        </label>
                        <input
                          type="datetime-local"
                          value={startDateTime}
                          onChange={(e) => setStartDateTime(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900"
                        />
                      </div>

                      {/* End Date & Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            End Date & Time *
                          </div>
                        </label>
                        <input
                          type="datetime-local"
                          value={endDateTime}
                          onChange={(e) => setEndDateTime(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900"
                        />
                      </div>
                    </>
                  )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      No actions available for this booking.
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  {getAvailableActions().length > 0 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-2.5 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Update Booking
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
};

export default UpdateBookingDialog;
