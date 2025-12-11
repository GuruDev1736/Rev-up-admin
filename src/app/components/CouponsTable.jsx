"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { getAllCoupons, toggleCouponStatus, deleteCoupon } from "@/services/api";
import ConfirmDialog from "./ConfirmDialog";

const CouponsTable = ({ refreshTrigger, userRole: userRoleProp }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = userRoleProp || sessionStorage.getItem("userRole");
    setUserRole(role);
  }, [userRoleProp]);

  useEffect(() => {
    fetchCoupons();
  }, [refreshTrigger]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons();
      
      if (response.STS === "200" && response.CONTENT) {
        setCoupons(response.CONTENT);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      const response = await toggleCouponStatus(couponId, !currentStatus);
      
      if (response.STS === "200") {
        setCoupons(prev =>
          prev.map(coupon =>
            coupon.id === couponId ? { ...coupon, isActive: !currentStatus } : coupon
          )
        );
      }
    } catch (error) {
      console.error("Error toggling coupon status:", error);
    }
  };

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      const response = await deleteCoupon(couponToDelete.id);
      
      if (response.STS === "200") {
        setCoupons(prev => prev.filter(c => c.id !== couponToDelete.id));
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
    } finally {
      setShowDeleteDialog(false);
      setCouponToDelete(null);
    }
  };

  const formatDate = (dateData) => {
    if (!dateData) return "N/A";
    
    // Handle array format [year, month, day]
    if (Array.isArray(dateData) && dateData.length === 3) {
      const [year, month, day] = dateData;
      const date = new Date(year, month - 1, day); // month is 0-indexed in JS
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    
    // Handle string format
    const date = new Date(dateData);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (dateData) => {
    if (!dateData) return false;
    
    let expiryDate;
    // Handle array format [year, month, day]
    if (Array.isArray(dateData) && dateData.length === 3) {
      const [year, month, day] = dateData;
      expiryDate = new Date(year, month - 1, day); // month is 0-indexed in JS
    } else {
      // Handle string format
      expiryDate = new Date(dateData);
    }
    
    return expiryDate < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f02521]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coupon Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {userRole === "ROLE_MASTER_ADMIN" && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={userRole === "ROLE_MASTER_ADMIN" ? "6" : "5"} className="px-6 py-12 text-center text-gray-500">
                  No coupons found. Create your first coupon!
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {coupon.couponCode}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{coupon.couponName}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {coupon.couponDescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {coupon.couponDiscount}% OFF
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {coupon.couponType?.trim() || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => userRole === "ROLE_MASTER_ADMIN" && handleToggleStatus(coupon.id, coupon.isActive)}
                      disabled={userRole !== "ROLE_MASTER_ADMIN"}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        coupon.isActive
                          ? "bg-green-500 focus:ring-green-500"
                          : "bg-gray-300 focus:ring-gray-400"
                      } ${userRole !== "ROLE_MASTER_ADMIN" ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          coupon.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  {userRole === "ROLE_MASTER_ADMIN" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => window.location.href = `/coupons/${coupon.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(coupon)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Coupon"
        message={`Are you sure you want to delete the coupon "${couponToDelete?.couponCode}"? This action cannot be undone.`}
      />
    </>
  );
};

export default CouponsTable;
