// Upload Service - API functions for file uploads

import { getAuthHeaders, getUserId } from "./apiHelpers";

const API_BASE_URL = "https://api.revupbikes.com/api";

/**
 * Upload image file
 * @param {File} file - Image file to upload
 * @param {string} fileName - Name of the file
 * @returns {Promise<Object>} Response with uploaded image URL
 */
export const uploadImage = async (file, fileName) => {
  try {
    const userId = getUserId();
    
    if (!userId) {
      return {
        success: false,
        message: "User ID not found. Please login again.",
      };
    }

    // Convert file to base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fileName: fileName,
        fileData: base64Data,
        userId: userId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.STS === "200") {
      return {
        success: true,
        imageUrl: data.CONTENT,
        message: data.MSG,
      };
    } else {
      return {
        success: false,
        message: data.MSG || "Failed to upload image",
      };
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      message: error.message || "An error occurred while uploading image",
    };
  }
};
