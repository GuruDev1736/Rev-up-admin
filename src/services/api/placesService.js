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
    return data;
  } catch (error) {
    console.error("Error fetching places:", error);
    throw error;
  }
};

/**
 * Create a new place
 * @param {Object} placeData - Place data to create
 * @returns {Promise<Object>} Response with created place data
 */
export const createPlace = async (placeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/places/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(placeData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating place:", error);
    throw error;
  }
};

/**
 * Update an existing place
 * @param {number} placeId - ID of the place to update
 * @param {Object} placeData - Updated place data
 * @returns {Promise<Object>} Response with updated place data
 */
export const updatePlace = async (placeId, placeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/places/update/${placeId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(placeData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating place:", error);
    throw error;
  }
};

/**
 * Delete a place
 * @param {number} placeId - ID of the place to delete
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deletePlace = async (placeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/places/delete/${placeId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting place:", error);
    throw error;
  }
};
