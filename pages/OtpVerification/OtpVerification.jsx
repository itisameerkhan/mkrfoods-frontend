import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './OtpVerification.scss';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; 
import { verifySignupOtp, resendSignupOtp } from '../../src/services/otpService'; 

const OtpVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/account');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
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

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            // Verify OTP using the service (handles URL logic correctly)
            const response = await verifySignupOtp({ email, otp: otpValue });
            const data = response.data; // Axios returns data in .data

            if (data && data.success) { // adjust check based on backend response format
                 const { email: verifiedEmail, name, password } = data.email ? { email: data.email, ...data } : data; // Fallback mapping depending on exact API response

                 // Note: response.data.data vs response.data depending on axios vs fetch
                 // Let's look at Account.jsx usage: 
                 // const { email, name, password } = response.data.data;
                 
                 // So we should match that structure.
                 const userData = data.data || data; // handle flexible response
                 const userEmail = userData.email;
                 const userName = userData.name;
                 const userPassword = userData.password;

                // OTP verified! Now create Firebase account
                toast.loading('Creating your account...');

                try {
                    // Create Firebase user
                    const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
                    const user = userCredential.user;

                    // Create Firestore user doc
                    await setDoc(doc(db, 'users', user.uid), {
                        uid: user.uid,
                        name: userName,
                        email: userEmail,
                        createdAt: new Date().toISOString(),
                        emailVerified: true,
                    });

                    toast.dismiss();
                    toast.success('Account created successfully!');
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                } catch (firebaseError) {
                    console.error('Firebase signup error:', firebaseError);
                    toast.error(`Account creation failed: ${firebaseError.message}`);
                    setLoading(false);
                }
            } else {
                toast.error(data.message || 'Invalid OTP');
                setLoading(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error verifying OTP. Please try again.';
            toast.error(msg);
            console.error(err);
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);

        try {
            await resendSignupOtp({ email });
            toast.success('OTP resent to your email!');
            setResendTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error resending OTP. Please try again.';
            toast.error(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-container">
            <div className="otp-card">
                <button className="close-btn" onClick={() => navigate('/account')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div className="otp-header">
                    <div className="otp-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M9 12l2 2 4-4"></path>
                        </svg>
                    </div>
                    <h1>Verification Code</h1>
                    <p className="otp-subtitle">
                        We have sent a verification code to<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="otp-form">
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="\d{1}"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="otp-input"
                                disabled={loading}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <button type="submit" disabled={loading || otp.join('').length < 6} className="verify-btn">
                        {loading ? (
                            <span className="loader">Verifying...</span>
                        ) : (
                            'Verify Account'
                        )}
                    </button>
                </form>

                <div className="otp-footer">
                    <p>Didn't receive the code?</p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || loading}
                        className="resend-btn"
                    >
                        {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
