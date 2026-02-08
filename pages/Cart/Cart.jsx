import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../../config/cartSlice";
import "./Cart.scss";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import CheckoutHeader from "../../components/CheckoutHeader/CheckoutHeader";

const getWeightInGrams = (weightLabel) => {
    const lower = weightLabel ? weightLabel.toLowerCase() : "";
    if (lower.includes('kg')) return parseFloat(lower) * 1000;
    return parseFloat(lower);
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.user);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleRemoveVariant = (productId, weight) => {
    dispatch(removeFromCart({ productId, weight }));
  };

  const handleQuantityChange = (productId, weight, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveVariant(productId, weight);
    } else {
      const product = cartItems.find(p => p.productId === productId);
      if (product && product.maxQuantity) {
          const currentTotalGrams = product.variants.reduce((sum, v) => {
             const qty = v.weight === weight ? newQuantity : v.quantity;
             return sum + (getWeightInGrams(v.weight) * qty);
          }, 0);
          
          if (currentTotalGrams > product.maxQuantity) {
              // Optionally show a toast or alert, or just return
              return; 
          }
      }
      dispatch(updateQuantity({ productId, weight, quantity: newQuantity }));
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
    }
  };

  const cartTotal = cartItems.reduce((sum, product) => {
    const productTotal = product.variants.reduce((variantSum, variant) =>
      variantSum + (variant.price * variant.quantity), 0);
    return sum + productTotal;
  }, 0);

  const itemCount = cartItems.reduce((sum, product) => {
    const productCount = product.variants.reduce((variantSum, variant) =>
      variantSum + variant.quantity, 0);
    return sum + productCount;
  }, 0);

  // Apply Coupon Function
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      // Fetch coupon from Firebase
      const { collection, getDocs, query, where } = await import("firebase/firestore");
      const couponsRef = collection(db, "coupons");
      const q = query(couponsRef, where("code", "==", couponCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCouponError("Invalid coupon code");
        setCouponLoading(false);
        return;
      }

      const couponDoc = querySnapshot.docs[0];
      const couponData = couponDoc.data();

      // Check if minimum order is met
      if (cartTotal < parseInt(couponData.minimumOrder)) {
        setCouponError(`Minimum order of ₹${couponData.minimumOrder} required`);
        setCouponLoading(false);
        return;
      }

      // Apply coupon
      const couponPayload = {
        code: couponData.code,
        discount: parseInt(couponData.discountPrice),
        minimumOrder: parseInt(couponData.minimumOrder)
      };
      setAppliedCoupon(couponPayload);
      localStorage.setItem("appliedCoupon", JSON.stringify(couponPayload)); // Persist to local storage
      setCouponCode("");
      setCouponError("");
    } catch (error) {
      setCouponError("Error validating coupon");
      console.error("Coupon error:", error);
    }

    setCouponLoading(false);
  };

  // Remove Coupon Function
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon"); // Remove from local storage
    setCouponCode("");
    setCouponError("");
  };

  // Handle Checkout
  const handleCheckout = () => {
    if (user && user.uid) {
      // User is logged in, redirect to address page
      navigate("/checkout/address");
    } else {
      // User is not logged in, redirect to login/signup
      navigate("/account");
    }
  };

  // Load coupon from local storage on mount
  useEffect(() => {
    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (error) {
        console.error("Error parsing saved coupon:", error);
        localStorage.removeItem("appliedCoupon");
      }
    }
  }, []);

  // Validate coupon when cart total changes
  useEffect(() => {
    // Check if applied coupon is still valid based on cart total
    if (appliedCoupon) {
        if (cartTotal < appliedCoupon.minimumOrder) {
            setAppliedCoupon(null);
            localStorage.removeItem("appliedCoupon"); // Remove invalid coupon
            setCouponError(`Coupon removed: Minimum order of ₹${appliedCoupon.minimumOrder} required`);
            setTimeout(() => setCouponError(""), 3000);
        }
    }
  }, [cartItems, cartTotal, appliedCoupon]);

  if (cartItems.length === 0) {
    return (
        <div className="cart-empty-maximalist">
        {/* Background image is handled in SCSS or via inline style if dynamic */}
        
        <div className="content-wrapper">
            <div className="empty-cart-icon">
              <i className="fas fa-shopping-basket"></i>
            </div>
            <h1 className="empty-title">Your Cart Feels Lonely</h1>
            <p className="empty-desc">
              Your cart is waiting for some delicious Andhra flavors.
            </p>
            
            <Link to="/" className="btn-browse-menu">
                <span>Browse Menu</span>
                <i className="fas fa-long-arrow-alt-right"></i>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-container">
        <CheckoutHeader activeStep="cart" />
        <div className="cart-top">
          <h1>Shopping Cart</h1>
          <div className="cart-controls">
            <span className="item-count">
              {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </span>
            <button className="btn-clear-cart" onClick={handleClearCart}>
              Clear cart
            </button>
          </div>
        </div>

        <div className="cart-layout">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="items-list">
              {cartItems.map((product) => (
                <div key={product.productId} className="cart-item-card">
                  {/* Product Header (Image & Name) */}
                  <div className="card-header">
                    <div className="product-image-wrapper">
                      <img src={product.image} alt={product.name} className="product-image" />
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      {/* Optional: Add category or short desc if available */}
                    </div>
                  </div>

                  {/* Variants List */}
                  <div className="variants-list">
                    {product.variants.map((variant) => (
                      <div key={`${product.productId}_${variant.weight}`} className="variant-row">
                        
                        {/* Row 1: Weight & Unit Price */}
                        <div className="variant-details">
                          <span className="variant-weight">{variant.weight}</span>
                          <span className="unit-price">₹ {variant.price}</span>
                        </div>

                        {/* Row 2: Controls (Qty & Subtotal & Delete) */}
                        <div className="variant-actions">
                          
                          <div className="quantity-selector">
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(product.productId, variant.weight, variant.quantity - 1)}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="qty-value"
                              value={variant.quantity}
                              readOnly
                            />
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(product.productId, variant.weight, variant.quantity + 1)}
                              disabled={(() => {
                                  if (!product.maxQuantity) return false;
                                  const currentProductGrams = product.variants.reduce((sum, v) => sum + (getWeightInGrams(v.weight) * v.quantity), 0);
                                  const variantGrams = getWeightInGrams(variant.weight);
                                  return currentProductGrams + variantGrams > product.maxQuantity;
                              })()}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>

                          <div className="variant-total">
                            ₹ {(variant.price * variant.quantity).toFixed(0)}
                          </div>

                          <button
                            className="btn-remove"
                            onClick={() => handleRemoveVariant(product.productId, variant.weight)}
                            aria-label="Remove item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Coupon Section (Visible only on mobile) */}
          <div className="mobile-coupon-section">
             <h3>Apply Coupon</h3>
             <div className="coupon-container">
                {!appliedCoupon ? (
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError("");
                      }}
                      disabled={couponLoading}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="applied-success">
                    <span>Code "{appliedCoupon.code}" applied</span>
                    <button onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                )}
                {couponError && <p className="error-msg">{couponError}</p>}
             </div>
          </div>

          {/* Mobile Cart Totals Section */}
          <div className="mobile-cart-totals">
              <h2>Cart totals</h2>

              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="amount">₹ {cartTotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="summary-row discount-row">
                  <span className="label">Discount</span>
                  <span className="amount discount">−₹ {appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span className="label">Shipping</span>
                <span className="amount shipping-free">₹ Free shipping</span>
              </div>

              <div className="summary-row total-row">
                <span className="label">Total:</span>
                <span className="amount total-amount">
                  ₹ {appliedCoupon ? (cartTotal - appliedCoupon.discount).toFixed(2) : cartTotal.toFixed(2)}
                </span>
              </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="cart-summary-section">
            <div className="summary-card">
              <h2>Cart totals</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span className="label">Subtotal</span>
                  <span className="amount">₹ {cartTotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="summary-row discount-row">
                    <span className="label">Discount</span>
                    <span className="amount discount">−₹ {appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span className="label">Shipping</span>
                  <span className="amount shipping-free">₹ Free shipping</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span className="label">Total:</span>
                  <span className="amount total-amount">
                    ₹ {appliedCoupon ? (cartTotal - appliedCoupon.discount).toFixed(2) : cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="btn-checkout" onClick={handleCheckout}>
                Proceed to checkout
              </button>

              {/* Coupon Section */}
              <div className="coupon-section">
                {!appliedCoupon ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError("");
                      }}
                      disabled={couponLoading}
                    />
                    <button
                      className="btn-apply-coupon"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="coupon-applied">
                    <div className="coupon-info">
                      <i className="fas fa-check-circle"></i>
                      <span>Coupon "{appliedCoupon.code}" applied</span>
                    </div>
                    <button className="btn-remove-coupon" onClick={handleRemoveCoupon}>
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="coupon-error">{couponError}</p>}
              </div>

              <Link to="/" className="btn-continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Checkout Bar */}
      <div className="mobile-checkout-bar">
        <div className="mobile-total">
          <span className="label">Total:</span>
          <span className="amount">
            ₹ {appliedCoupon ? (cartTotal - appliedCoupon.discount).toFixed(2) : cartTotal.toFixed(2)}
          </span>
        </div>
        <button className="btn-mobile-checkout" onClick={handleCheckout}>
          Proceed to Buy
        </button>
      </div>
    </div>
  );
};

export default Cart;