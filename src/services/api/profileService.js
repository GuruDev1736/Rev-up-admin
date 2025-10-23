// Profile API Service

const API_BASE_URL = "https://api.revupbikes.com/api";

/**
 * Get User Profile
 * @param {number} userId - User ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to fetch profile");
    }

    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    throw error;
  }
};

/**
 * Update User Profile
 * @param {Object} profileData - Profile data to update
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Updated profile response
 */
export const updateUserProfile = async (profileData, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    throw error;
  }
};

/**
 * Upload Profile Picture
 * @param {File} file - Image file
 * @param {number} userId - User ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Upload response with image URL
 */
export const uploadProfilePicture = async (file, userId, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const res = await fetch(`${API_BASE_URL}/user/profile/upload-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to upload profile picture");
    }

    return data;
  } catch (error) {
    console.error("Error uploading profile picture:", error.message);
    throw error;
  }
};
