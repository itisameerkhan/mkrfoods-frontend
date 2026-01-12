import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { db } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import "./CheckoutAuth.scss";

const CheckoutAuth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const auth = getAuth();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                // Sign in
                await signInWithEmailAndPassword(auth, email, password);
                navigate("/checkout/address");
            } else {
                // Sign up
                if (!name.trim()) {
                    setError("Please enter your name");
                    setLoading(false);
                    return;
                }

                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    setLoading(false);
                    return;
                }

                if (password.length < 6) {
                    setError("Password should be at least 6 characters");
                    setLoading(false);
                    return;
                }

                // Create user
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Update user profile with name
                await updateProfile(userCredential.user, {
                    displayName: name
                });

                // Store user data in Firestore with complete user profile
                try {
                    await addDoc(collection(db, "users"), {
                        uid: userCredential.user.uid,
                        name: name,
                        email: email,
                        mobile: '',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        // Multiple addresses - start with empty array
                        addresses: [],
                        // Order history - start with empty array
                        orderHistory: [],
                    });
                } catch (firestoreError) {
                    console.error("Error storing user data:", firestoreError);
                }

                navigate("/checkout/address");
            }
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email already in use");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email address");
            } else if (err.code === "auth/weak-password") {
                setError("Password is too weak");
            } else if (err.code === "auth/user-not-found") {
                setError("User not found");
            } else if (err.code === "auth/wrong-password") {
                setError("Incorrect password");
            } else {
                setError(err.message || "An error occurred");
            }
        }

        setLoading(false);
    };

    // Google Sign In
    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user exists in Firestore
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "==", result.user.uid));
            const querySnapshot = await getDocs(q);

            // If user doesn't exist, create a new record
            if (querySnapshot.empty) {
                try {
                    await addDoc(collection(db, "users"), {
                        uid: result.user.uid,
                        name: result.user.displayName || "",
                        email: result.user.email,
                        mobile: '',
                        photoURL: result.user.photoURL || "",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        // Multiple addresses - start with empty array
                        addresses: [],
                        // Order history - start with empty array
                        orderHistory: [],
                    });
                } catch (firestoreError) {
                    console.error("Error storing user data:", firestoreError);
                }
            }

            navigate("/checkout/address");
        } catch (err) {
            if (err.code === "auth/popup-closed-by-user") {
                setError("Sign in cancelled");
            } else {
                setError(err.message || "An error occurred");
            }
        }

        setLoading(false);
    };

    return (
        <div className="checkout-auth">
            <div className="checkout-container">
                <div className="auth-card">
                    <h1>{isLogin ? "Login" : "Create Account"}</h1>
                    <p className="subtitle">
                        {isLogin ? "Welcome back! Please login to continue checkout" : "Create a new account to proceed with checkout"}
                    </p>

                    <form onSubmit={handleAuth} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
                        </button>
                    </form>

                    <div className="divider">
                        <span>Or continue with</span>
                    </div>

                    <button
                        type="button"
                        className="btn-google"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <i className="fab fa-google"></i>
                        Sign {isLogin ? "in" : "up"} with Google
                    </button>
                    <div className="toggle-auth">
                        <p>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                    setEmail("");
                                    setPassword("");
                                    setConfirmPassword("");
                                    setName("");
                                }}
                            >
                                {isLogin ? "Sign Up" : "Login"}
                            </button>
                        </p>
                    </div>

                    <button type="button" className="btn-back" onClick={() => navigate("/cart")}>
                        ← Back to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutAuth;
