# Firebase Phone Authentication Setup Guide

## Required Steps in Firebase Console

### 1. Enable Phone Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (MKRFoods)
3. Go to **Authentication** → **Sign-in method**
4. Click on **Phone** provider
5. Click **Enable** and save

### 2. Configure reCAPTCHA v3

1. In Authentication → Sign-in method → Phone
2. Under "Phone numbers for testing", you can optionally add test phone numbers
3. reCAPTCHA v3 is enabled by default, but verify it's set up:
   - Go to **Authentication** → **Settings**
   - Check that reCAPTCHA is configured

### 3. Add Your Domain to Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domain(s):
   - For local development: `localhost` should already be there
   - For production: Add your production domain
   - Examples:
     - `http://localhost:5173` (Vite default)
     - `http://localhost:3000` (if using different port)
     - `yourdomain.com`

### 4. Test Phone Numbers (Optional - for Testing)

1. In **Phone** sign-in method
2. Add test phone numbers with test OTP codes:
   - Phone: `+91-XXXXXXXXXX`
   - Code: `123456` (or any 6-digit code)
   - This allows testing without getting real SMS

### 5. Enable SMS in Your Region (India)

For users in India, make sure SMS is properly configured:

1. Go to **Project Settings** → **General**
2. Ensure your billing is enabled (required for production SMS)
3. For development, you can use test phone numbers (see step 4)

## Development vs Production

### Development Mode

- Use test phone numbers from Firebase console
- No SMS charges
- OTP codes are predefined

### Production Mode

1. Enable billing in Firebase project
2. Configure SMS provider (Firebase uses Twilio/SAP Customer Data Cloud)
3. Set spending limits to prevent abuse
4. Use real phone numbers

## How the OTP Flow Works

1. **User enters phone number** (+91 country code automatically added)
2. **System validates phone number** (10 digits for India)
3. **Firebase sends OTP via SMS** (or uses test code if test number)
4. **reCAPTCHA verification** happens invisibly
5. **User enters 6-digit OTP**
6. **System verifies and creates account**
7. **User data stored in Firestore**

## Troubleshooting

### "Failed to send OTP"

- Check if phone authentication is enabled
- Verify domain is in authorized domains
- Check browser console for detailed error
- Ensure phone number is in correct format (10 digits)

### reCAPTCHA errors

- Clear browser cache
- Check if recaptcha-container div exists in HTML
- Verify domain is whitelisted in Google reCAPTCHA settings

### SMS not received

- Check if test phone numbers are configured
- Verify billing is enabled for production
- Check phone number format (+91XXXXXXXXXX)

### "OTP session expired"

- OTP is valid for 1 minute by default
- User must enter OTP within this time
- After expiry, request new OTP

## Files Modified

- `Account.jsx` - Phone OTP authentication logic
- `Account.scss` - Phone input and OTP form styling

## Features Implemented

✅ Phone number input with +91 country code
✅ 10-digit validation
✅ OTP sending via Firebase
✅ reCAPTCHA verification
✅ 60-second OTP expiry timer
✅ Resend OTP functionality
✅ Detailed error messages
✅ User data storage in Firestore
✅ Google Sign-in alternative
✅ Name field (optional)
