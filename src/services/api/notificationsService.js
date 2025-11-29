// Notifications Service - API functions for notifications management

import { getAuthHeaders } from "./apiHelpers";
import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Get notifications by place ID
 * @param {number} placeId - The ID of the place
 * @returns {Promise<Object>} Response with notifications data
 */
export const getNotificationsByPlace = async (placeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/place/${placeId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      STS: "500",
      MSG: error.message || "An error occurred while fetching notifications",
      CONTENT: [],
    };
  }
};

/**
 * Mark notification as read
 * @param {number} notificationId - The ID of the notification
 * @param {boolean} isRead - Whether the notification should be marked as read (true) or unread (false)
 * @returns {Promise<Object>} Response with updated notification
 */
export const markNotificationAsRead = async (notificationId, isRead = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/status/${notificationId}?isRead=${isRead}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating notification status:", error);
    return {
      STS: "500",
      MSG: error.message || "An error occurred",
      CONTENT: null,
    };
  }
};
