// Bookings API Service

import { API_BASE_URL } from "@/config/apiConfig";
import { getAuthHeaders } from "./apiHelpers";

/**
 * Get all bookings
 * @returns {Promise<Object>} Response with all bookings
 */
export const getAllBookings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to fetch bookings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Response with booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to fetch booking");
    }

    return data;
  } catch (error) {
    console.error("Error fetching booking:", error.message);
    throw error;
  }
};

/**
 * Update booking status
 * @param {number} bookingId - Booking ID
 * @param {string} status - New booking status
 * @returns {Promise<Object>} Response with update status
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingStatus: status }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to update booking status");
    }

    return data;
  } catch (error) {
    console.error("Error updating booking status:", error.message);
    throw error;
  }
};

/**
 * Update booking details
 * @param {number} bookingId - Booking ID
 * @param {Object} bookingData - Updated booking data
 * @returns {Promise<Object>} Response with update status
 */
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to update booking");
    }

    return data;
  } catch (error) {
    console.error("Error updating booking:", error.message);
    throw error;
  }
};

/**
 * Activate booking (CONFIRMED -> ACTIVE)
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Response with activation status
 */
export const activateBooking = async (bookingId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/active`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to activate booking");
    }

    return data;
  } catch (error) {
    console.error("Error activating booking:", error.message);
    throw error;
  }
};

/**
 * Complete booking (ACTIVE -> COMPLETED)
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Response with completion status
 */
export const completeBooking = async (bookingId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to complete booking");
    }

    return data;
  } catch (error) {
    console.error("Error completing booking:", error.message);
    throw error;
  }
};

/**
 * Refund booking
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Response with refund status
 */
export const refundBooking = async (bookingId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/refund`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to refund booking");
    }

    return data;
  } catch (error) {
    console.error("Error refunding booking:", error.message);
    throw error;
  }
};

/**
 * Cancel booking
 * @param {number} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Response with cancellation status
 */
export const cancelBooking = async (bookingId, reason) => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason: reason }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to cancel booking");
    }

    return data;
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    throw error;
  }
};
