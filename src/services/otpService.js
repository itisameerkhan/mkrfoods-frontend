import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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