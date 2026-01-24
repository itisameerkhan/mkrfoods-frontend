import axios from 'axios';

// Use environment variable for API URL
// Use environment variable for API URL (Origin) and append /api
const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

console.log("OTP Service API URL:", API_URL);
 

/**
 * Request to send an OTP for account signup.
 * @param {object} userData - { name, email, password }
 */
export const sendSignupOtp = (userData) => {
  return axios.post(`${API_URL}/send-otp`, userData);
};

/**
 * Verify the OTP for account signup.
 * @param {object} otpData - { email, otp }
 */
export const verifySignupOtp = (otpData) => {
  return axios.post(`${API_URL}/verify-otp`, otpData);
};

/**
 * Request to resend the OTP for account signup.
 * @param {object} emailData - { email }
 */
export const resendSignupOtp = (emailData) => {
  return axios.post(`${API_URL}/resend-otp`, emailData);
};

