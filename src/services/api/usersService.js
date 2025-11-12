// Users Service - API functions for users management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Get all users
 * @returns {Promise<Object>} Response with all users data
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} userId - ID of the user
 * @returns {Promise<Object>} Response with user data
 */
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {number} userId - ID of the user to delete
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/delete/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

/**
 * Update user information
 * @param {number} userId - ID of the user to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Response with updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/update/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
