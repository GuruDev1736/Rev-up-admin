// Bikes Service - API functions for bike management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Get all bikes
 * @returns {Promise<Object>} Response with all bikes data
 */
export const getAllBikes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bikes/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        bikes: data.CONTENT,
        message: data.MSG,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to fetch bikes",
      };
    }
  } catch (error) {
    console.error("Error fetching bikes:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching bikes",
    };
  }
};

/**
 * Update bike details
 * @param {number} bikeId - The ID of the bike to update
 * @param {number} placeId - The ID of the place
 * @param {Object} bikeData - The bike data to update
 * @returns {Promise<Object>} Response with updated bike data
 */
export const updateBike = async (bikeId, placeId, bikeData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bikes/update/${bikeId}?placeId=${placeId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(bikeData),
      }
    );

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        bike: data.CONTENT,
        message: data.MSG,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to update bike",
      };
    }
  } catch (error) {
    console.error("Error updating bike:", error);
    return {
      success: false,
      message: error.message || "An error occurred while updating bike",
    };
  }
};

/**
 * Create a new bike
 * @param {number} placeId - The ID of the place
 * @param {Object} bikeData - The bike data to create
 * @returns {Promise<Object>} Response with created bike data
 */
export const createBike = async (placeId, bikeData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bikes/create?placeId=${placeId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bikeData),
      }
    );

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        bike: data.CONTENT,
        message: data.MSG,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to create bike",
      };
    }
  } catch (error) {
    console.error("Error creating bike:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating bike",
    };
  }
};

/**
 * Delete a bike
 * @param {number} bikeId - The ID of the bike to delete
 * @returns {Promise<Object>} Response with deletion status
 */
export const deleteBike = async (bikeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bikes/delete/${bikeId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        message: data.MSG || "Bike deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to delete bike",
      };
    }
  } catch (error) {
    console.error("Error deleting bike:", error);
    return {
      success: false,
      message: error.message || "An error occurred while deleting bike",
    };
  }
};
