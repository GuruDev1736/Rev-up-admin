"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Bike,
  User,
  MapPin,
  Check,
  X,
} from "lucide-react";
import MessageDialog from "./MessageDialog";
import ConfirmDialog from "./ConfirmDialog";
import { approveBikeRequest, rejectBikeRequest } from "@/services/api/bikeRequestService";

export const BikeRequestsTable = ({ initialRequests, loading, onRequestsUpdate }) => {
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const itemsPerPage = 20;

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  // Search and filter
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((request) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          request.id?.toString().includes(searchLower) ||
          request.user?.firstName?.toLowerCase().includes(searchLower) ||
          request.user?.lastName?.toLowerCase().includes(searchLower) ||
          request.user?.email?.toLowerCase().includes(searchLower) ||
          request.bike?.bikeName?.toLowerCase().includes(searchLower) ||
          request.bike?.brand?.toLowerCase().includes(searchLower) ||
          request.requestNote?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.status === statusFilter.toUpperCase()
      );
    }

    // Sort by date - latest first
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Descending order (latest first)
    });

    return filtered;
  }, [requests, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setConfirmAction("approve");
    setShowConfirmDialog(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setConfirmAction("reject");
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    console.log("Confirm action:", confirmAction, "Request:", selectedRequest);
    setShowConfirmDialog(false);
    setProcessingId(selectedRequest.id);

    try {
      let response;
      if (confirmAction === "approve") {
        console.log("Calling approve API for request ID:", selectedRequest.id);
        response = await approveBikeRequest(selectedRequest.id);
      } else if (confirmAction === "reject") {
        console.log("Calling reject API for request ID:", selectedRequest.id);
        response = await rejectBikeRequest(selectedRequest.id);
      }

      console.log("API Response:", response);

      if (response?.success) {
        setMessageType("success");
        setMessageText(response.message);
        setShowMessageDialog(true);
        
        // Refresh the requests list
        if (onRequestsUpdate) {
          onRequestsUpdate();
        }
      } else {
        setMessageType("error");
        setMessageText(response?.message || "Operation failed");
        setShowMessageDialog(true);
      }
    } catch (error) {
      console.error("Error in handleConfirmAction:", error);
      setMessageType("error");
      setMessageText("An error occurred while processing the request");
      setShowMessageDialog(true);
    } finally {
      setProcessingId(null);
      setSelectedRequest(null);
      setConfirmAction(null);
    }
  };

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
      return "N/A";
    }
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return price ? `₹${price.toLocaleString()}` : "N/A";
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVE":
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECT":
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "PENDING":
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVE":
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECT":
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f02521] to-[#f85d5d] bg-clip-text text-transparent">
          Bike Requests
        </h1>
        <p className="text-gray-600 mt-2">Manage all bike rental requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, bike, or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent outline-none transition-all bg-white text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approve">Approved</option>
              <option value="reject">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {currentRequests.length} of {filteredRequests.length} requests
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bike
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Request Note
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f02521]"></div>
                      <span className="ml-3 text-gray-600">Loading requests...</span>
                    </div>
                  </td>
                </tr>
              ) : currentRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No bike requests found
                  </td>
                </tr>
              ) : (
                currentRequests.map((request) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        #{request.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {request.user?.profilePicture ? (
                          <img
                            src={request.user.profilePicture}
                            alt={`${request.user.firstName} ${request.user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#f02521] to-[#f85d5d] flex items-center justify-center text-white font-semibold">
                            {request.user?.firstName?.charAt(0)}
                            {request.user?.lastName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.user?.firstName} {request.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {request.bike?.bikeImage ? (
                          <img
                            src={request.bike.bikeImage}
                            alt={request.bike.bikeName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Bike className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.bike?.bikeName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.bike?.brand} - {request.bike?.bikeModel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.bike?.place?.placeName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.bike?.place?.placeLocation || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.requestNote || "No note"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status || "PENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {request.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              disabled={processingId === request.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <AnimatePresence>
        {showDetailsDialog && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold">Request Details</h2>
                <p className="text-white/90 mt-1">Request ID: #{selectedRequest.id}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* User Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#f02521]" />
                    User Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.user?.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bike Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-[#f02521]" />
                    Bike Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex gap-4 mb-4">
                      {selectedRequest.bike?.bikeImage && (
                        <img
                          src={selectedRequest.bike.bikeImage}
                          alt={selectedRequest.bike.bikeName}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedRequest.bike?.bikeName}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Brand:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedRequest.bike?.brand}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Model:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedRequest.bike?.bikeModel}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedRequest.bike?.category}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Fuel Type:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedRequest.bike?.fuelType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Per Day</p>
                        <p className="text-lg font-bold text-[#f02521]">
                          {formatPrice(selectedRequest.bike?.pricePerDay)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Per Week</p>
                        <p className="text-lg font-bold text-[#f02521]">
                          {formatPrice(selectedRequest.bike?.pricePerWeek)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Per Month</p>
                        <p className="text-lg font-bold text-[#f02521]">
                          {formatPrice(selectedRequest.bike?.pricePerMonth)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Information */}
                {selectedRequest.bike?.place && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#f02521]" />
                      Place Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.bike.place.placeName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedRequest.bike.place.placeLocation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Request Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Request Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          selectedRequest.status
                        )} mt-1`}
                      >
                        {getStatusIcon(selectedRequest.status)}
                        {selectedRequest.status || "PENDING"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Request Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(selectedRequest.createdAt)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-2">Request Note</p>
                      <p className="text-base text-gray-900 bg-white p-3 rounded border border-gray-200">
                        {selectedRequest.requestNote || "No note provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsDialog(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Dialog */}
      {showMessageDialog && (
        <MessageDialog
          type={messageType}
          message={messageText}
          onClose={() => setShowMessageDialog(false)}
        />
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title={`${confirmAction === "approve" ? "Approve" : "Reject"} Request`}
          message={`Are you sure you want to ${confirmAction} this bike request from ${selectedRequest?.user?.firstName} ${selectedRequest?.user?.lastName}?`}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setShowConfirmDialog(false);
            setSelectedRequest(null);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
};

export default BikeRequestsTable;
