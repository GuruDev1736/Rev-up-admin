// API Helper Utilities

/**
 * Get authentication token from session storage
 * @returns {string|null} The auth token or null
 */
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("token");
  }
  return null;
};

/**
 * Get headers with authentication token
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object with Content-Type and Authorization
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Get user ID from session storage
 * @returns {string|null} The user ID or null
 */
export const getUserId = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("userId");
  }
  return null;
};

/**
 * Get user role from session storage
 * @returns {string|null} The user role or null
 */
export const getUserRole = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("userRole");
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
  }
};
