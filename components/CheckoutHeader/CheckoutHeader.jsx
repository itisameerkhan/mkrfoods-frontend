import React from 'react';
import { Link } from 'react-router-dom';
import './CheckoutHeader.scss';

const CheckoutHeader = ({ activeStep }) => {
  return (
    <div className="checkout-header">
      <div className="steps-container">
        <Link to="/cart" className={`step ${activeStep === 'cart' ? 'active' : ''} ${['cart', 'address', 'payment'].includes(activeStep) ? 'completed' : ''}`}>
          <span className="step-label">CART</span>
        </Link>
        <div className="step-separator">------------------</div>
        <Link to="/checkout/address" className={`step ${activeStep === 'address' ? 'active' : ''} ${['address', 'payment'].includes(activeStep) ? 'completed' : ''}`}>
          <span className="step-label">ADDRESS</span>
        </Link>
        <div className="step-separator">------------------</div>

        {/* Only allow navigation to Payment if we have a saved address in session (or we are already on payment) */}
        <Link 
          to="/checkout/payment" 
          className={`step ${activeStep === 'payment' ? 'active' : ''}`}
          onClick={(e) => {
             const savedAddress = sessionStorage.getItem("checkoutAddress");
             if (!savedAddress && activeStep !== 'payment') {
                e.preventDefault();
                alert("Please select an address first.");
             }
          }}
        >
          <span className="step-label">PAYMENT</span>
        </Link>
      </div>
    </div>
  );
};

export default CheckoutHeader;
