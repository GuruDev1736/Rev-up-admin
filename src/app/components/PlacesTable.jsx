"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePlace, togglePlaceStatus } from "@/services/api/placesService";
import ConfirmDialog from "./ConfirmDialog";
import MessageDialog from "./MessageDialog";

export default function PlacesTable({ initialPlaces, loading, onPlacesUpdate }) {
  const router = useRouter();
  const [places, setPlaces] = useState(initialPlaces);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [placeToToggle, setPlaceToToggle] = useState(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [toggleTargetStatus, setToggleTargetStatus] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    setPlaces(initialPlaces);
  }, [initialPlaces]);

  // Search filtering
  const filteredPlaces = useMemo(() => {
    let filtered = [...places];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((place) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          place.placeName?.toLowerCase().includes(searchLower) ||
          place.placeDescription?.toLowerCase().includes(searchLower) ||
          place.placeLocation?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [places, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlaces = filteredPlaces.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleEdit = (placeId) => {
    router.push(`/places/${placeId}`);
  };

  const handleDeleteClick = (place) => {
    setPlaceToDelete(place);
    setShowConfirmDialog(true);
  };

  const getPlaceEnabled = (place) => {
    // Normalize various possible fields that may represent enabled state
    if (!place) return true;
    if (typeof place.status === "boolean") return place.status;
    if (typeof place.isActive === "boolean") return place.isActive;
    if (typeof place.enabled === "boolean") return place.enabled;
    if (typeof place.active === "boolean") return place.active;
    // sometimes status may be string like "ACTIVE"/"INACTIVE"
    if (typeof place.status === "string") {
      return place.status.toLowerCase() === "active" || place.status.toLowerCase() === "enabled";
    }
    return true;
  };

  const handleToggleClick = (place) => {
    const currentlyEnabled = getPlaceEnabled(place);
    setPlaceToToggle(place);
    setToggleTargetStatus(!currentlyEnabled);
    setShowToggleConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowConfirmDialog(false);
    
    try {
      const response = await deletePlace(placeToDelete.id);
      
      if (response.STS === "200") {
        setMessageType("success");
        setMessageText(response.MSG || "Place deleted successfully!");
        setShowMessageDialog(true);
        
        // Refresh places list
        if (onPlacesUpdate) {
          onPlacesUpdate();
        }
      } else {
        setMessageType("error");
        setMessageText(response.MSG || "Failed to delete place");
        setShowMessageDialog(true);
      }
    } catch (error) {
      setMessageType("error");
      setMessageText("Error deleting place. Please try again.");
      setShowMessageDialog(true);
    }
    
    setPlaceToDelete(null);
  };

  const handleToggleConfirm = async () => {
    setShowToggleConfirm(false);
    try {
      if (!placeToToggle) return;
      const response = await togglePlaceStatus(placeToToggle.id, toggleTargetStatus);
      if (response.STS === "200") {
        setMessageType("success");
        setMessageText(response.MSG || (toggleTargetStatus ? "Place enabled successfully" : "Place disabled successfully"));
        setShowMessageDialog(true);
        if (onPlacesUpdate) onPlacesUpdate();
      } else {
        setMessageType("error");
        setMessageText(response.MSG || "Failed to update place status");
        setShowMessageDialog(true);
      }
    } catch (error) {
      setMessageType("error");
      setMessageText("Error updating place status. Please try again.");
      setShowMessageDialog(true);
    } finally {
      setPlaceToToggle(null);
      setToggleTargetStatus(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setPlaceToDelete(null);
  };

  const handleMessageClose = () => {
    setShowMessageDialog(false);
    setMessageText("");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPlaces.length)} of{" "}
            {filteredPlaces.length} places
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Place Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {currentPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No places found</p>
                    </td>
                  </tr>
                ) : (
                  currentPlaces.map((place, index) => (
                    <motion.tr
                      key={place.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={place.placeImage}
                          alt={place.placeName}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {place.placeName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {place.placeDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {place.placeLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(place.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(place.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(place)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleClick(place)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title={getPlaceEnabled(place) ? "Disable" : "Enable"}
                          >
                            {getPlaceEnabled(place) ? (
                              <span className="text-sm font-medium">Disable</span>
                            ) : (
                              <span className="text-sm font-medium">Enable</span>
                            )}
                          </motion.button>
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Place"
        message={`Are you sure you want to delete "${placeToDelete?.placeName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toggle Enable/Disable Dialog */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        title={toggleTargetStatus ? "Enable Place" : "Disable Place"}
        message={`Are you sure you want to ${toggleTargetStatus ? "enable" : "disable"} "${placeToToggle?.placeName}"?`}
        onConfirm={handleToggleConfirm}
        onCancel={() => {
          setShowToggleConfirm(false);
          setPlaceToToggle(null);
          setToggleTargetStatus(false);
        }}
        confirmText={toggleTargetStatus ? "Enable" : "Disable"}
        cancelText="Cancel"
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
}
