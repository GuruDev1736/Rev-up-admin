// Admin Service - API functions for admin management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Register a new admin
 * @param {number} placeId - Place ID for the admin
 * @param {Object} adminData - Admin registration data
 * @returns {Promise<Object>} Response with registered admin data
 */
export const registerAdmin = async (placeId, adminData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/register?placeId=${placeId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.MSG || "Admin registered successfully",
        admin: data.CONTENT,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to register admin",
      };
    }
  } catch (error) {
    console.error("Error registering admin:", error);
    return {
      success: false,
      message: "An error occurred while registering admin",
    };
  }
};

/**
 * Get all admins
 * @returns {Promise<Object>} Response with all admins data
 */
export const getAllAdmins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/admin/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

/**
 * Update an existing admin
 * @param {number} adminId - ID of the admin to update
 * @param {Object} adminData - Updated admin data
 * @returns {Promise<Object>} Response with updated admin data
 */
export const updateAdmin = async (adminId, adminData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/${adminId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.MSG || "Admin updated successfully",
        admin: data.CONTENT,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to update admin",
      };
    }
  } catch (error) {
    console.error("Error updating admin:", error);
    return {
      success: false,
      message: "An error occurred while updating admin",
    };
  }
};

/**
 * Delete an admin
 * @param {number} adminId - ID of the admin to delete
 * @returns {Promise<Object>} Response with deletion status
 */
export const deleteAdmin = async (adminId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/${adminId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.MSG || "Admin deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to delete admin",
      };
    }
  } catch (error) {
    console.error("Error deleting admin:", error);
    return {
      success: false,
      message: "An error occurred while deleting admin",
    };
  }
};
