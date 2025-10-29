// Places Service - API functions for places management

import { getAuthHeaders } from "./apiHelpers";

const API_BASE_URL = "https://api.revupbikes.com/api";

/**
 * Get all places
 * @returns {Promise<Object>} Response with all places data
 */
export const getAllPlaces = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/places/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        places: data.CONTENT,
        message: data.MSG,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to fetch places",
      };
    }
  } catch (error) {
    console.error("Error fetching places:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching places",
    };
  }
};
