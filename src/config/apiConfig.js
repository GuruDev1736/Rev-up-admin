// API Configuration
// Manages API base URL based on environment

const ENV = process.env.NEXT_PUBLIC_ENV || 'DEV';

const API_URLS = {
  DEV: process.env.NEXT_PUBLIC_API_BASE_URL_DEV || 'http://l0wksg888kwswwckgookg0kk.72.61.171.73.sslip.io/api',
  PROD: process.env.NEXT_PUBLIC_API_BASE_URL_PROD || 'https://api.revupbikes.com/api',
};

export const API_BASE_URL = API_URLS[ENV];

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const getCurrentEnv = () => {
  return ENV;
};

console.log(`🚀 Running in ${ENV} mode with API: ${API_BASE_URL}`);
