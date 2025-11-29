"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import MessageDialog from "./MessageDialog";
import UpdateBookingDialog from "./UpdateBookingDialog";

export const BookingsTable = ({ initialBookings, loading, onBookingsUpdate }) => {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  // Search and filter
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((booking) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          booking.id?.toString().includes(searchLower) ||
          booking.user?.firstName?.toLowerCase().includes(searchLower) ||
          booking.user?.lastName?.toLowerCase().includes(searchLower) ||
          booking.user?.email?.toLowerCase().includes(searchLower) ||
          booking.bike?.bikeName?.toLowerCase().includes(searchLower) ||
          booking.paymentId?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.bookingStatus === statusFilter.toUpperCase()
      );
    }

    // Sort by date and time - latest first
    filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.createdAt || 0);
      const dateB = new Date(b.bookingDate || b.createdAt || 0);
      return dateB - dateA; // Descending order (latest first)
    });

    return filtered;
  }, [bookings, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setShowUpdateDialog(true);
  };

  const handleUpdateSuccess = (message) => {
    setMessageType("success");
    setMessageText(message);
    setShowMessageDialog(true);
    
    // Refresh bookings list
    if (onBookingsUpdate) {
      onBookingsUpdate();
    }
  };

  const handleDownloadInvoice = (invoiceUrl) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, "_blank");
    }
  };

  const handleMessageClose = () => {
    setShowMessageDialog(false);
    setMessageText("");
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
      CONFIRMED: { color: "bg-purple-100 text-purple-700", icon: CheckCircle },
      ACTIVE: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      COMPLETED: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-700", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      PAID: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      REFUNDED: { color: "bg-purple-100 text-purple-700", icon: CheckCircle },
      UNPAID: { color: "bg-red-100 text-red-700", icon: XCircle },
      PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f02521]"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} of{" "}
            {filteredBookings.length} bookings
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bike
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No bookings found</p>
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          #{booking.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {booking.user?.firstName} {booking.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.user?.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.user?.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={booking.bike?.bikeImage}
                            alt={booking.bike?.bikeName}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.bike?.bikeName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.bike?.bikeModel}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.totalDays > 0 && `${booking.totalDays}d `}
                          {booking.totalHours > 0 && `${booking.totalHours}h`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.startDateTime}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {booking.endDateTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.paymentId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.bookingStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditBooking(booking)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </motion.button>
                          {booking.invoiceUrl && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownloadInvoice(booking.invoiceUrl)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download Invoice"
                            >
                              <Download size={18} />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex gap-2">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                    disabled={page === "..."}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Dialog */}
      {showDetailsDialog && selectedBooking && (
        <BookingDetailsDialog
          booking={selectedBooking}
          onClose={() => setShowDetailsDialog(false)}
        />
      )}

      {/* Update Booking Dialog */}
      <UpdateBookingDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        booking={selectedBooking}
        onSuccess={handleUpdateSuccess}
      />

      {/* Message Dialog */}
      <MessageDialog
        isOpen={showMessageDialog}
        type={messageType}
        message={messageText}
        onClose={handleMessageClose}
      />
    </>
  );
};

// Booking Details Dialog Component
const BookingDetailsDialog = ({ booking, onClose }) => {
  const formatCurrency = (amount) => `₹${amount?.toFixed(2) || "0.00"}`;
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {booking.user?.firstName} {booking.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{booking.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{booking.user?.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Bike Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bike Information</h3>
            <div className="flex gap-4">
              <img
                src={booking.bike?.bikeImage}
                alt={booking.bike?.bikeName}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{booking.bike?.bikeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium text-gray-900">{booking.bike?.bikeModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-medium text-gray-900">{booking.bike?.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration</p>
                  <p className="font-medium text-gray-900">{booking.bike?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{booking.bike?.place?.placeName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date & Time</p>
                <p className="font-medium text-gray-900">{booking.startDateTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date & Time</p>
                <p className="font-medium text-gray-900">{booking.endDateTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {booking.totalDays > 0 && `${booking.totalDays} Days `}
                  {booking.totalHours > 0 && `${booking.totalHours} Hours`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium text-gray-900">{booking.paymentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium text-gray-900">{booking.paymentStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Status</p>
                <p className="font-medium text-gray-900">{booking.bookingStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium text-gray-900">{formatDateTime(booking.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
            <div className="flex gap-3">
              {booking.aadharcardUrl && (
                <a
                  href={booking.aadharcardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Aadhar Card
                </a>
              )}
              {booking.drivingLicenseUrl && (
                <a
                  href={booking.drivingLicenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Driving License
                </a>
              )}
              {booking.invoiceUrl && (
                <a
                  href={booking.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Invoice
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
