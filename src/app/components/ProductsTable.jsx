"use client";

import { motion } from "framer-motion";
import { Search, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllBikes, getAllPlaces, deleteBike } from "../../services/api";
import ConfirmDialog from "./ConfirmDialog";
import MessageDialog from "./MessageDialog";

const ProductsTable = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [searchTerms, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterPlace, setFilterPlace] = useState("all");
  const [userRole, setUserRole] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState(null);
  const [messageDialogConfig, setMessageDialogConfig] = useState({
    type: "success",
    title: "",
    message: "",
  });

  // Fetch bikes and places on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const role = sessionStorage.getItem("userRole");
        setUserRole(role);
        const userPlaceId = sessionStorage.getItem("placeId");
        
        const [bikesResponse, placesResponse] = await Promise.all([
          getAllBikes(),
          getAllPlaces(),
        ]);
        
        if (bikesResponse.success) {
          let bikes = bikesResponse.bikes;
          
          // Filter bikes by placeId for ROLE_ADMIN users
          if (role === "ROLE_ADMIN" && userPlaceId) {
            bikes = bikes.filter(bike => {
              // Check multiple possible place id fields
              const bikePlaceId = bike.place?.id || bike.placeId || bike.place_id;
              return bikePlaceId?.toString() === userPlaceId;
            });
          }
          
          setProducts(bikes);
          setError(null);
        } else {
          setError(bikesResponse.message);
        }

        if (placesResponse.STS === "200" && placesResponse.CONTENT) {
          setAllPlaces(placesResponse.CONTENT);
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique values for filters
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [products]);

  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(products.map(p => p.status).filter(Boolean))];
    return uniqueStatuses.sort();
  }, [products]);

  // Get places from API data
  const places = useMemo(() => {
    return allPlaces.map(p => ({
      id: p.id,
      name: p.name || p.placeName
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPlaces]);

  // Combined search and filter
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerms) {
      const lower = searchTerms.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.bikeName && p.bikeName.toLowerCase().includes(lower)) ||
          (p.bikeModel && p.bikeModel.toLowerCase().includes(lower)) ||
          (p.category && p.category.toLowerCase().includes(lower)) ||
          (p.registrationNumber && p.registrationNumber.toLowerCase().includes(lower)) ||
          (p.brand && p.brand.toLowerCase().includes(lower))
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Apply brand filter
    if (filterBrand !== "all") {
      filtered = filtered.filter(p => p.brand === filterBrand);
    }

    // Apply place filter (only for MASTER_ADMIN)
    if (filterPlace !== "all") {
      filtered = filtered.filter(p => {
        const bikePlaceId = p.place?.id || p.placeId || p.place_id;
        return bikePlaceId?.toString() === filterPlace;
      });
    }

    return filtered;
  }, [searchTerms, products, filterCategory, filterStatus, filterBrand, filterPlace]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterBrand("all");
    setFilterPlace("all");
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerms, filterCategory, filterStatus, filterBrand, filterPlace]);

  // Navigate to edit page
  const handleEditClick = (id) => {
    router.push(`/products/${id}`);
  };

  // Show delete confirmation dialog
  const handelDelete = (id) => {
    setBikeToDelete(id);
    setShowConfirmDialog(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);

    if (!bikeToDelete) return;

    try {
      // Call delete API
      const response = await deleteBike(bikeToDelete);

      if (response.success) {
        // Remove from UI on success
        setProducts((prev) => prev.filter((p) => p.id !== bikeToDelete));
        
        // Show success message
        setMessageDialogConfig({
          type: "success",
          title: "Success",
          message: response.message || "Bike deleted successfully!",
        });
        setShowMessageDialog(true);
      } else {
        // Show error message
        setMessageDialogConfig({
          type: "error",
          title: "Error",
          message: response.message || "Failed to delete bike",
        });
        setShowMessageDialog(true);
      }
    } catch (error) {
      console.error("Error deleting bike:", error);
      setMessageDialogConfig({
        type: "error",
        title: "Error",
        message: "An error occurred while deleting the bike",
      });
      setShowMessageDialog(true);
    } finally {
      setBikeToDelete(null);
    }
  };

  // safe price formatter to avoid toFixed errors
  const formatPrice = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? `₹${n.toFixed(2)}` : "₹0.00";
  };

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col justify-between items-start mb-6 gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-100 text-center md:text-left">
            Bikes List
          </h2>

          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search Bikes..."
              value={searchTerms}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#2f2f2f] text-white placeholder-gray-400 rounded-lg pl-10 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-gray-50 transition duration-200 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:flex-wrap items-start md:items-center">
          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#2f2f2f] text-white rounded-lg px-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-gray-50 transition duration-200 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="w-full md:w-auto">
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="bg-[#2f2f2f] text-white rounded-lg px-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-gray-50 transition duration-200 text-sm"
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#2f2f2f] text-white rounded-lg px-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-gray-50 transition duration-200 text-sm"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Place Filter - Only for MASTER_ADMIN */}
          {userRole === "ROLE_MASTER_ADMIN" && (
            <div className="w-full md:w-auto">
              <select
                value={filterPlace}
                onChange={(e) => setFilterPlace(e.target.value)}
                className="bg-[#2f2f2f] text-white rounded-lg px-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-gray-50 transition duration-200 text-sm"
              >
                <option value="all">All Places</option>
                {places.map(place => (
                  <option key={place.id} value={place.id.toString()}>{place.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {(filterCategory !== "all" || filterBrand !== "all" || filterStatus !== "all" || filterPlace !== "all" || searchTerms) && (
            <button
              onClick={resetFilters}
              className="bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 text-sm font-medium w-full md:w-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f02521] border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading bikes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                {[
                  "Bike Name",
                  "Model",
                  "Brand",
                  "Category",
                  "Price/Day",
                  "Price/Week",
                  "Price/Month",
                  "Quantity",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                    {filteredProducts.length === 0 ? "No bikes found" : "No bikes on this page"}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col md:table-row border-b md:border-b-0 border-gray-700 md:border-none p-2 md:p-0"
                  >
                    {/* Mobile view (simplified info block) */}
                    <td className="md:hidden px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Image
                            src={product.bikeImage || "/placeholder-bike.jpg"}
                            alt={product.bikeName}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-100">
                              {product.bikeName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {product.bikeModel}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-1 -mt-1 -mr-1">
                          <button
                            className="text-indigo-500 hover:text-indigo-300"
                            aria-label="Edit bike"
                            onClick={() => handleEditClick(product.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-300"
                            aria-label={`Delete ${product.bikeName}`}
                            onClick={() => handelDelete(product.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-300 space-y-1">
                        <div>Brand: {product.brand}</div>
                        <div>Category: {product.category}</div>
                        <div>Price/Day: ₹{product.pricePerDay?.toFixed(2)}</div>
                        <div>Price/Week: ₹{product.pricePerWeek?.toFixed(2)}</div>
                        <div>Price/Month: ₹{product.pricePerMonth?.toFixed(2)}</div>
                        <div>Quantity: {product.quantity || 0}</div>
                      </div>
                    </td>

                    {/* Desktop view */}
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      <div className="flex items-center">
                        <Image
                          src={product.bikeImage || "/placeholder-bike.jpg"}
                          alt={product.bikeName}
                          width={36}
                          height={36}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">{product.bikeName}</div>
                      </div>
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      {product.bikeModel}
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      {product.brand}
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      {product.category}
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      ₹{product.pricePerDay?.toFixed(2)}
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      ₹{product.pricePerWeek?.toFixed(2)}
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      ₹{product.pricePerMonth?.toFixed(2)}
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      {product.quantity || 0}
                    </td>

                    {/* Actions desktop */}
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                      <div className="flex space-x-1 -ml-2">
                        <button
                          className="text-indigo-500 hover:text-indigo-300 mr-1 cursor-pointer"
                          aria-label="Edit bike"
                          onClick={() => handleEditClick(product.id)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-300 cursor-pointer"
                          aria-label={`Delete ${product.bikeName}`}
                          onClick={() => handelDelete(product.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          {/* Info */}
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} bikes
          </div>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-[#2f2f2f] text-gray-300 hover:bg-[#3f3f3f] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg transition ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                          : "bg-[#2f2f2f] text-gray-300 hover:bg-[#3f3f3f]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-[#2f2f2f] text-gray-300 hover:bg-[#3f3f3f] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setBikeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Bike"
        message="Are you sure you want to delete this bike? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Message Dialog */}
      <MessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        type={messageDialogConfig.type}
        title={messageDialogConfig.title}
        message={messageDialogConfig.message}
      />
    </motion.div>
  );
};

export default ProductsTable;
