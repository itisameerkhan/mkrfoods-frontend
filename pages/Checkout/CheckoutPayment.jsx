import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import CheckoutHeader from "../../components/CheckoutHeader/CheckoutHeader";
import "./CheckoutPayment.scss";

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  // Local state for UI
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [address, setAddress] = useState(null);
  const [pricing, setPricing] = useState({
    cartTotal: 0,
    couponDiscount: 0,
    finalAmount: 0
  });

  useEffect(() => {
    // Load data from session storage
    const savedAddressStr = sessionStorage.getItem("checkoutAddress");
    const savedPricingStr = sessionStorage.getItem("checkoutPricing");

    if (!savedAddressStr) {
      alert("Please select an address first.");
      navigate("/checkout/address");
      return;
    }

    setAddress(JSON.parse(savedAddressStr));
    if (savedPricingStr) {
      setPricing(JSON.parse(savedPricingStr));
    }
  }, [navigate]);



  const handlePayment = async () => {
    try {
      if (!pricing.finalAmount) {
        alert("Invalid transaction amount.");
        return;
      }

      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
           alert("User not authenticated. Please log in.");
           navigate("/account");
           return;
      }

      const token = await currentUser.getIdToken();

      const paymentData = {
        userId: user?.uid,
        amount: pricing.finalAmount,
        name: address.fullName || user?.displayName,
        email: user?.email,
        phone: address.mobileNumber
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/payment/create`,
        paymentData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
      );

      const { orderId, currency, amount } = response.data.data ? response.data.data : response.data;

      // Sync to Firestore (Status: Created)
      try {
          await setDoc(doc(db, "payments", orderId), {
              userId: user?.uid,
              paymentId: "",
              orderId: orderId,
              amount: pricing.finalAmount,
              currency: "INR",
              notes: {
                  name: address.fullName || user?.displayName,
                  email: user?.email,
                  phone: address.mobileNumber
              },
              status: "created",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          });
      } catch (err) {
          console.error("Firestore Sync Error:", err);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: "INR",
        name: "MKR Foods",
        description: `Order #${orderId}`,
        order_id: orderId,
        prefill: {
          name: address.fullName || user?.displayName,
          email: user?.email,
          contact: address.mobileNumber,
        },
        theme: {
          color: "#e74c3c", // Brand color
        },
        modal: {
            ondismiss: function() {
                // Handle payment modal dismissal if needed
            }
        },
        handler: async function (response) {
            try {
                // Sync to Firestore (Status: Success)
                try {
                    await updateDoc(doc(db, "payments", response.razorpay_order_id), {
                        paymentId: response.razorpay_payment_id,
                        status: "success",
                        updatedAt: new Date().toISOString()
                    });
                } catch (err) {
                     console.error("Firestore Update Error:", err);
                }

                const verifyRes = await axios.post(
                  `${import.meta.env.VITE_REACT_APP_API_URL}/api/payment/verify`,
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }
                );

                if (verifyRes.data.success) {
                  alert("Payment Successful!");
                  // navigate('/order-success');
                } else {
                  alert("Payment Verification Failed");
                }
            } catch (error) {
                console.error("Verification Error:", error);
                alert("Payment Verification Failed");
            }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating payment order:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="checkout-payment-page">
      <CheckoutHeader activeStep="payment" />
      
      <div className="payment-layout">
        {/* Left Column: Details & Method */}
        <div className="main-section">
            
            {/* 1. Address Summary */}
            <div className="section-card address-preview">
                <div className="card-header">
                    <h3>Deliver To:</h3>
                    <button className="btn-change" onClick={() => navigate('/checkout/address')}>CHANGE</button>
                </div>
                {address && (
                    <div className="address-details">
                        <span className="name-tag">{address.type || 'HOME'}</span>
                        <h4>{address.fullName} <span>{address.mobileNumber}</span></h4>
                        <p>{address.flatHouseNo}, {address.areaStreet}, {address.landmark ? `Near ${address.landmark}, ` : ''}{address.townCity} - {address.pincode}</p>
                    </div>
                )}
            </div>

            {/* 2. Payment Options */}
            <div className="section-card payment-methods">
                <div className="card-header">
                    <h3>Select Payment Method</h3>
                </div>
                
                <div className="methods-list">
                    {/* Razorpay Option */}
                    <div 
                        className={`method-item ${paymentMethod === 'RAZORPAY' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('RAZORPAY')}
                    >
                        <div className="radio-circle">
                            {paymentMethod === 'RAZORPAY' && <div className="inner-circle" />}
                        </div>
                        <div className="method-info">
                            <div className="method-title">
                                <span>UPI, Cards, Wallets, NetBanking</span>
                                <div className="icons-row">
                                    <i className="fab fa-google-pay" title="Google Pay" style={{color: '#EA4335'}}></i>
                                    <i className="fab fa-cc-visa" title="Visa" style={{color: '#1A1F71'}}></i>
                                    <i className="fab fa-cc-mastercard" title="Mastercard" style={{color: '#EB001B'}}></i>
                                </div>
                            </div>
                            <p className="method-desc">Pay securely using Razorpay gateway.</p>
                        </div>
                    </div>

                    {/* COD Option (Disabled) */}
                    <div className="method-item disabled">
                        <div className="radio-circle disabled"></div>
                        <div className="method-info">
                            <span className="method-title">Cash on Delivery (COD)</span>
                            <p className="method-desc">Currently unavailable for your location.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Secure Badge */}
            <div className="secure-badge">
                <i className="fas fa-lock"></i>
                <span>Payments are 100% secure and encrypted.</span>
            </div>
        </div>

        {/* Right Column: Price Summary */}
        <div className="sidebar-section">
            <div className="price-card">
                <h3>Price Details</h3>
                <div className="price-row">
                    <span>Subtotal</span>
                    <span>₹{pricing.cartTotal.toFixed(2)}</span>
                </div>
                {pricing.couponDiscount > 0 && (
                    <div className="price-row discount">
                        <span>Discount</span>
                        <span>- ₹{pricing.couponDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="price-row">
                    <span>Delivery Charges</span>
                    <span className="free">FREE</span>
                </div>
                <div className="divider"></div>
                <div className="price-row total">
                    <span>Total Amount</span>
                    <span>₹{pricing.finalAmount.toFixed(2)}</span>
                </div>

                <div className="total-savings">
                    You save ₹{pricing.couponDiscount.toFixed(2)} on this order
                </div>

                <button className="btn-pay-now" onClick={handlePayment}>
                    PAY ₹{pricing.finalAmount.toFixed(2)}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPayment;
