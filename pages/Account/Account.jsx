import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth, db } from "../../config/firebase";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import logo from '../../src/assets/logo.png';
import './Account.scss';

const Account = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Helper to handle user data after successful social login
  const handleUserAuth = async (user, providerName) => {
    try {
      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          mobile: '', // Providers don't always give phone
          verified: true,
          provider: providerName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addresses: [],
          orderHistory: [],
        });
        toast.success(`Account created with ${providerName}!`);
      } else {
        toast.success(`Welcome back! Signed in with ${providerName}.`);
      }
      navigate('/');
    } catch (error) {
      console.error("Firestore Error:", error);
      toast.error("Error updating profile: " + error.message);
    }
  };



  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleUserAuth(result.user, 'Google');
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="login-split-container">
      {/* Left Side - Image Board */}
      <div className="login-image-section">
        <div className="image-overlay">
          <div className="overlay-content">
             <h1>Taste Authentic <br/> Andhra Flavours</h1>

          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-content">
          <div className="brand-header">
             <img src={logo} alt="MKR Foods" className="brand-logo"/>
             <h2>Welcome Back</h2>
             <p className="subtitle">Sign in to continue your delicious journey</p>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleGoogleSignIn} 
              disabled={loading} 
              className="google-signin-btn"
            >
              <div className="icon-box">
                <svg viewBox="0 0 48 48" width="24" height="24">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
              </div>
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="legal-text">
            By continuing, you agree to our <strong>Terms of Service</strong> & <strong>Privacy Policy</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;