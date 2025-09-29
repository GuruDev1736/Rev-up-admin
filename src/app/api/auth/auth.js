// lib/api.js
// Login User

export const loginUser = async ({ email, password }) => {
  try {
    const res = await fetch("https://api.revupbikes.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Login failed");
    }
    return await res.json();
  } catch (error) {
    console.error("Error in Login User:", error.message);
    throw error;
  }
};

// Register User
export const registerUser = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  profilePicture,
}) => {
  try {
    const res = await fetch(
      "https://api.revupbikes.com/api/auth/admin/register",
      {
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
      }
    );

    const data = await res.json();
    console.log("Register API response:", data);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Error in Register User:", error.message);
    throw error;
  }
};
