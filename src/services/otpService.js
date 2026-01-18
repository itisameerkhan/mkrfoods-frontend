import axios from 'axios';

// Dynamic configuration to handle both Local (8080) and Production (Render)
// This eliminates the need for environment variables that might be undefined
let API_URL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_URL = "http://localhost:8080/api";
} else {
    API_URL = "https://mkrfoodsbackend.onrender.com/api";
}

console.log("OTP Service API URL:", API_URL);

console.log("OTP Service API URL:", API_URL); // Debugging log
 

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

