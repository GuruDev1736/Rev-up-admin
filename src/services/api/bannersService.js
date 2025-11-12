// Banners Service - API functions for banners management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Get all banners
 * @returns {Promise<Object>} Response with all banners data
 */
export const getAllBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};

/**
 * Create a new banner
 * @param {Object} bannerData - Banner data to create
 * @returns {Promise<Object>} Response with created banner data
 */
export const createBanner = async (bannerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bannerData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

/**
 * Update an existing banner
 * @param {number} bannerId - ID of the banner to update
 * @param {Object} bannerData - Updated banner data
 * @returns {Promise<Object>} Response with updated banner data
 */
export const updateBanner = async (bannerId, bannerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/update/${bannerId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(bannerData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

/**
 * Delete a banner
 * @param {number} bannerId - ID of the banner to delete
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteBanner = async (bannerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/delete/${bannerId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};
