# Frontend Integration Guide - Using Backend OTP API

## Overview

Replace Firebase Phone Auth with the Node.js Backend OTP API.

## Current vs Updated Flow

### Current (Firebase Phone Auth)

```
Frontend → Firebase Auth → reCAPTCHA → SMS → User
```

### Updated (Backend API)

```
Frontend → Backend API → Fast2SMS → SMS → Backend → User
```

## Integration Steps

### 1. Create API Service File

Create `Frontend/src/services/otpService.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const sendOtp = async (phoneNumber) => {
  try {
    const response = await fetch(`${API_URL}/api/phone-otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const response = await fetch(`${API_URL}/api/phone-otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, otp }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to verify OTP");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (phoneNumber) => {
  try {
    const response = await fetch(`${API_URL}/api/phone-otp/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP");
    }
    return data;
  } catch (error) {
    throw error;
  }
};
```

### 2. Update Account.jsx

Replace the Firebase phone auth logic with backend API calls:

```javascript
import { sendOtp, verifyOtp, resendOtp } from "../../services/otpService";

// In your handleSendOtp function:
const handleSendOtp = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      setLoading(false);
      return;
    }

    if (phoneNumber.length !== 10) {
      setError("Phone number must be 10 digits");
      setLoading(false);
      return;
    }

    // Call backend API instead of Firebase
    const response = await sendOtp(phoneNumber);

    if (response.success) {
      setAuthStep("otp");
      setOtpTimer(300); // 5 minutes
      setError("");
    } else {
      setError(response.message || "Failed to send OTP");
    }
  } catch (err) {
    console.error("Error sending OTP:", err);
    setError(err.message || "Failed to send OTP");
  }

  setLoading(false);
};

// In your handleVerifyOtp function:
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    // Call backend API instead of Firebase
    const response = await verifyOtp(phoneNumber, otp);

    if (response.success) {
      // OTP verified - create user in Firebase or your database
      if (name.trim()) {
        // Update auth user profile
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      // Store user data in Firestore
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(collection(db, "users"), {
            uid: auth.currentUser.uid,
            name: name || "User",
            phoneNumber: response.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (firestoreError) {
        console.error("Error storing user data:", firestoreError);
      }

      // Reset form
      setPhoneNumber("");
      setName("");
      setOtp("");
      setAuthStep("phone");
    } else {
      setError(response.message || "Failed to verify OTP");
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    setError(err.message || "Failed to verify OTP");
  }

  setLoading(false);
};

// In your handleResendOtp function:
const handleResendOtp = async (e) => {
  e.preventDefault();
  setOtp("");
  setOtpTimer(300); // 5 minutes
  setError("");

  try {
    const response = await resendOtp(phoneNumber);

    if (response.success) {
      setError("");
    } else {
      setError(response.message || "Failed to resend OTP");
    }
  } catch (err) {
    console.error("Error resending OTP:", err);
    setError(err.message || "Failed to resend OTP");
  }
};
```

### 3. Remove Firebase Phone Auth

Remove from imports:

```javascript
// Remove these:
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Keep only what you need:
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
```

Remove these from code:

- `setupRecaptcha()` function
- Firebase phone auth logic
- reCAPTCHA verifier cleanup

### 4. Update .env File

Add API URL to frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:8080
```

For production:

```env
REACT_APP_API_URL=https://your-backend-domain.com
```

### 5. Remove reCAPTCHA Container

Remove from JSX:

```javascript
<div id="recaptcha-container"></div>
```

This is no longer needed since backend handles reCAPTCHA.

## Simplified Component Structure

After integration, your phone auth flow becomes:

```javascript
const [authStep, setAuthStep] = useState("phone"); // 'phone' or 'otp'
const [phoneNumber, setPhoneNumber] = useState("");
const [otp, setOtp] = useState("");
const [name, setName] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [otpTimer, setOtpTimer] = useState(0);

// Send OTP
const handleSendOtp = async (e) => { ... };

// Verify OTP
const handleVerifyOtp = async (e) => { ... };

// Resend OTP
const handleResendOtp = async (e) => { ... };
```

## Benefits of Backend API

✅ **No Firebase dependency** for phone auth
✅ **Real SMS delivery** via Fast2SMS
✅ **Complete control** over OTP logic
✅ **Better error handling** with custom messages
✅ **Easy to add** user creation logic
✅ **Can integrate** with backend database
✅ **Cost effective** - pay only for SMS sent
✅ **No reCAPTCHA** complexity on frontend

## Testing Checklist

- [ ] Send OTP returns phone number
- [ ] OTP expires after 5 minutes
- [ ] Invalid OTP shows error message
- [ ] Max 3 attempts works
- [ ] Resend OTP works
- [ ] Backend and Frontend on same network
- [ ] CORS errors are resolved
- [ ] User data saved to Firestore after verify
- [ ] Name field works (optional)
- [ ] Change number button works

## Environment Variables

### Frontend (`.env`)

```env
REACT_APP_API_URL=http://localhost:8080
```

### Backend (`.env`)

```env
PORT=8080
NODE_ENV=development
FAST2SMS_API_KEY=R4fvc9BwlQDn5zL7gJiEpoFkteWPNdSqHY0jAOG3ZuMbsymKVhKRHSNU2wLIeW1Mar7dXzqBoiFvgZO3
```

## Error Handling Examples

```javascript
try {
  const response = await sendOtp(phoneNumber);
  if (response.success) {
    // Proceed to OTP input
  } else {
    // response.message contains error
    setError(response.message);
  }
} catch (error) {
  // Network or other errors
  setError(error.message);
}
```

## Production Considerations

1. **Use HTTPS** for all API calls
2. **Add rate limiting** on backend
3. **Use database** instead of in-memory OTP storage
4. **Add user authentication** (JWT tokens)
5. **Log OTP attempts** for security
6. **Add IP-based rate limiting**
7. **Use production Fast2SMS account**
8. **Monitor SMS usage** and costs

## Rollback Steps

If you need to rollback to Firebase:

1. Revert the imports to use Firebase phone auth
2. Uncomment reCAPTCHA code
3. Update Account component
4. Remove API service file
