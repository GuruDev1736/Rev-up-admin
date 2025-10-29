// API Services Index - Central export point for all API services

export * from "./authService";
export * from "./forgotPasswordService";
export * from "./profileService";
export * from "./bikesService";
export * from "./placesService";
export * from "./uploadService";
export * from "./apiHelpers";

// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://api.revupbikes.com/api",
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};
