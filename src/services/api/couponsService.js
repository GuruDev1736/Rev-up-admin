// Coupons Service - API functions for coupon management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Get all coupons
 * @returns {Promise<Object>} Response with all coupons
 */
export const getAllCoupons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return {
      STS: "400",
      MSG: error.message || "Failed to fetch coupons",
    };
  }
};

/**
 * Create a new coupon
 * @param {Object} couponData - Coupon data
 * @returns {Promise<Object>} Response with created coupon
 */
export const createCoupon = async (couponData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    return {
      STS: "400",
      MSG: error.message || "Failed to create coupon",
    };
  }
};

/**
 * Update a coupon
 * @param {number} couponId - Coupon ID
 * @param {Object} couponData - Updated coupon data
 * @returns {Promise<Object>} Response with updated coupon
 */
export const updateCoupon = async (couponId, couponData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/update/${couponId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    return {
      STS: "400",
      MSG: error.message || "Failed to update coupon",
    };
  }
};

/**
 * Delete a coupon
 * @param {number} couponId - Coupon ID
 * @returns {Promise<Object>} Response
 */
export const deleteCoupon = async (couponId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/delete/${couponId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return {
      STS: "400",
      MSG: error.message || "Failed to delete coupon",
    };
  }
};

/**
 * Toggle coupon active status
 * @param {number} couponId - Coupon ID
 * @param {boolean} status - Active status
 * @returns {Promise<Object>} Response
 */
export const toggleCouponStatus = async (couponId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coupons/status?id=${couponId}&status=${status}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return {
      STS: "400",
      MSG: error.message || "Failed to toggle coupon status",
    };
  }
};
