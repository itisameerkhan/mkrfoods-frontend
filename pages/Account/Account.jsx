import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth, db } from "../../config/firebase";
import { doc, setDoc } from 'firebase/firestore';
import validator from 'validator';
import { sendSignupOtp, verifySignupOtp, resendSignupOtp } from '../../src/services/otpService';
import './Account.scss';

const Account = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsOtpSent(false);
    setFormData({ name: '', email: '', password: '' });
    setOtp(['', '', '', '', '', '']);
  };

  const validateForm = () => {
    if (!validator.isEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!validator.isLength(formData.password || '', { min: 6 })) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && !validator.isLength(formData.name.trim(), { min: 2 })) {
      toast.error('Please enter your name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success('Signed in successfully!');
        navigate('/');
      } else {
        // Step 1: Send OTP to the backend, but don't create user yet
        await sendSignupOtp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setIsOtpSent(true);
        toast.success('OTP has been sent to your email!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputRefs = React.useRef([]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const newOtp = [...otp];
    let currentFocus = -1;

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
        if (i < 5) {
          currentFocus = i + 1;
        } else {
          currentFocus = 5;
        }
      }
    }

    setOtp(newOtp);
    if (currentFocus !== -1) {
      inputRefs.current[currentFocus]?.focus();
    }
  };


  const verifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);

    try {
      // Step 2: Verify OTP with the backend
      const response = await verifySignupOtp({
        email: formData.email,
        otp: finalOtp,
      });

      const { email, name, password } = response.data.data;

      // Step 3: Create user in Firebase upon successful verification
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      await updateProfile(res.user, { displayName: name });

      // Step 4: Save user data to Firestore with full user profile
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name: name,
        email: email,
        mobile: '',
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Multiple addresses - start with empty array
        addresses: [],
        // Order history - start with empty array
        orderHistory: [],
      });

      toast.success("Account created and verified successfully!");
      setIsOtpSent(false);
      navigate('/');

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await resendSignupOtp({ email: formData.email });
      toast.success("A new OTP has been sent to your email.");
      navigate('/profile');
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <p className="subtitle">Please enter your details</p>
          <h1>{isLogin ? 'Welcome back' : 'Create an account'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Jon Snow"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isOtpSent}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isOtpSent}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingRight: '40px' }}
                disabled={isOtpSent}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666'
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </span>
            </div>
          </div>

          <div className="form-options">
            {!isLogin && <button type="button" className="forgot-link">Forgot password</button>}
          </div>

          <button type="submit" disabled={loading || isOtpSent} className="btn-primary">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="footer-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode}>{isLogin ? 'Sign up' : 'Sign in'}</span>
        </p>
      </div>

      {isOtpSent && (
        <div className="otp-overlay">
          <div className="otp-modal">
            <button className="close-btn" onClick={() => setIsOtpSent(false)}>&times;</button>
            <div className="otp-modal-content">
              <h1>OTP VERIFICATION</h1>
              <p>An authentication code has been sent to <strong>{formData.email}</strong></p>

              <div className="otp-input-container">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{1}"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    onPaste={handlePaste}
                  />
                ))}
              </div>

              <button onClick={verifyOtp} disabled={loading} className="btn-primary btn-verify">
                {loading ? 'Verifying...' : 'VERIFY'}
              </button>

              <p className="resend-text">
                Didn't receive the code?{' '}
                <span className="resend-btn" onClick={handleResendOtp} style={{ pointerEvents: loading ? 'none' : 'auto' }}>
                  Resend OTP
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;