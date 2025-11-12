// Forgot Password API Service

import { API_BASE_URL } from "@/config/apiConfig";

/**
 * Send OTP to user's email
 * @param {string} email - User email address
 * @returns {Promise<Object>} Response with OTP sent status
 */
export const sendOtp = async (email) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/forgot-password/send-otp?email=${email}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to send OTP");
    }

    return data;
  } catch (error) {
    console.error("Error in Send OTP:", error.message);
    throw error;
  }
};

/**
 * Verify OTP
 * @param {string} email - User email address
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Response with OTP verification status
 */
export const verifyOtp = async (email, otp) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/forgot-password/verify-otp?email=${email}&otp=${otp}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to verify OTP");
    }

    return data;
  } catch (error) {
    console.error("Error in Verify OTP:", error.message);
    throw error;
  }
};

/**
 * Reset Password
 * @param {string} email - User email address
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response with password reset status
 */
export const resetPassword = async (email, newPassword) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/forgot-password/reset-password?email=${email}&newPassword=${newPassword}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Failed to reset password");
    }

    return data;
  } catch (error) {
    console.error("Error in Reset Password:", error.message);
    throw error;
  }
};
