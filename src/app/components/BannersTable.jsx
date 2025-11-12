"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteBanner } from "@/services/api/bannersService";
import ConfirmDialog from "./ConfirmDialog";
import MessageDialog from "./MessageDialog";

export default function BannersTable({ initialBanners, loading, onBannersUpdate }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const itemsPerPage = 20;

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  // Search filtering
  const filteredBanners = useMemo(() => {
    let filtered = [...banners];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((banner) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          banner.bannerTitle?.toLowerCase().includes(searchLower) ||
          banner.bannerDescription?.toLowerCase().includes(searchLower) ||
          banner.navigationLink?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [banners, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBanners = filteredBanners.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleEdit = (bannerId) => {
    router.push(`/banners/${bannerId}`);
  };

  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setShowConfirmDialog(false);
    
    try {
      const response = await deleteBanner(bannerToDelete.id);
      
      if (response.STS === "200") {
        setMessageType("success");
        setMessageText(response.MSG || "Banner deleted successfully!");
        setShowMessageDialog(true);
        
        // Refresh banners list
        if (onBannersUpdate) {
          onBannersUpdate();
        }
      } else {
        setMessageType("error");
        setMessageText(response.MSG || "Failed to delete banner");
        setShowMessageDialog(true);
      }
    } catch (error) {
      setMessageType("error");
      setMessageText("Error deleting banner. Please try again.");
      setShowMessageDialog(true);
    }
    
    setBannerToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setBannerToDelete(null);
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
        {/* Search */}
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
                placeholder="Search banners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBanners.length)} of{" "}
            {filteredBanners.length} banners
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
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Navigation Link
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
                {currentBanners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No banners found</p>
                    </td>
                  </tr>
                ) : (
                  currentBanners.map((banner, index) => (
                    <motion.tr
                      key={banner.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={banner.bannerImage}
                          alt={banner.bannerTitle}
                          className="w-20 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150x100";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {banner.bannerTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {banner.bannerDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-blue-600 hover:underline max-w-xs truncate">
                          {banner.navigationLink || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(banner.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(banner.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(banner)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
        title="Delete Banner"
        message={`Are you sure you want to delete "${bannerToDelete?.bannerTitle}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
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
