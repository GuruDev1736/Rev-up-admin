// Authentication API Service

const API_BASE_URL = "https://api.revupbikes.com/api";

/**
 * Login User
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const loginUser = async ({ email, password }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Error in Login User:", error.message);
    throw error;
  }
};

/**
 * Register User
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const registerUser = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  profilePicture,
}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        profilePicture,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.MSG || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Error in Register User:", error.message);
    throw error;
  }
};
