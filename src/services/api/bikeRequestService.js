// Bike Request Service - API functions for bike request management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Get all bike requests
 * @returns {Promise<Object>} Response with all bike requests data
 */
export const getAllBikeRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/request-bike/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        requests: data.CONTENT,
        message: data.MSG,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to fetch bike requests",
      };
    }
  } catch (error) {
    console.error("Error fetching bike requests:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching bike requests",
    };
  }
};

/**
 * Approve bike request
 * @param {number} requestId - The ID of the bike request to approve
 * @returns {Promise<Object>} Response with updated request data
 */
export const approveBikeRequest = async (requestId) => {
  try {
    console.log(`Approving request ID: ${requestId}`);
    const response = await fetch(
      `${API_BASE_URL}/request-bike/approve/${requestId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();
    console.log("Approve response:", data);

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        request: data.CONTENT,
        message: data.MSG || "Request approved successfully",
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to approve bike request",
      };
    }
  } catch (error) {
    console.error("Error approving bike request:", error);
    return {
      success: false,
      message: error.message || "An error occurred while approving bike request",
    };
  }
};

/**
 * Reject bike request
 * @param {number} requestId - The ID of the bike request to reject
 * @returns {Promise<Object>} Response with updated request data
 */
export const rejectBikeRequest = async (requestId) => {
  try {
    console.log(`Rejecting request ID: ${requestId}`);
    const response = await fetch(
      `${API_BASE_URL}/request-bike/reject/${requestId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();
    console.log("Reject response:", data);

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        request: data.CONTENT,
        message: data.MSG || "Request rejected successfully",
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to reject bike request",
      };
    }
  } catch (error) {
    console.error("Error rejecting bike request:", error);
    return {
      success: false,
      message: error.message || "An error occurred while rejecting bike request",
    };
  }
};
