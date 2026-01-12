import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../../config/cartSlice";
import "./Cart.scss";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";

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
      setAppliedCoupon({
        code: couponData.code,
        discount: parseInt(couponData.discountPrice),
        minimumOrder: parseInt(couponData.minimumOrder)
      });
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
      navigate("/checkout/address");
    }
  };

  // Validate coupon when cart total changes
  useEffect(() => {
    console.log("Cart updated:", cartItems);

    // Check if applied coupon is still valid based on cart total
    if (appliedCoupon && cartTotal < appliedCoupon.minimumOrder) {
      setAppliedCoupon(null);
      setCouponError(`Coupon removed: Minimum order of ₹${appliedCoupon.minimumOrder} required`);
      // Clear error message after 3 seconds
      setTimeout(() => setCouponError(""), 3000);
    }
  }, [cartItems, cartTotal, appliedCoupon]);

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <div className="cart-empty">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <Link to="/" className="btn-continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-container">
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
                  <div className="product-row">
                    {/* Product Image */}
                    <div className="product-image-wrapper">
                      <img src={product.image} alt={product.name} className="product-image" />
                    </div>

                    {/* Product Details */}
                    <div className="product-details-column">
                      <h3 className="product-title">{product.name}</h3>

                      {/* Weight Options */}
                      <div className="variants-container">
                        {product.variants.map((variant) => (
                          <div key={`${product.productId}_${variant.weight}`} className="variant-item">
                            <div className="variant-info">
                              <span className="variant-weight">{variant.weight}</span>
                              <span className="variant-price">₹ {variant.price}</span>
                            </div>

                            <div className="variant-controls">
                              <div className="quantity-selector">
                                <button
                                  className="qty-btn"
                                  onClick={() => handleQuantityChange(product.productId, variant.weight, variant.quantity - 1)}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  className="qty-value"
                                  value={variant.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    handleQuantityChange(product.productId, variant.weight, val);
                                  }}
                                  min="1"
                                />
                                <button
                                  className="qty-btn"
                                  onClick={() => handleQuantityChange(product.productId, variant.weight, variant.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>

                              <div className="variant-subtotal">
                                ₹ {(variant.price * variant.quantity).toFixed(2)}
                              </div>

                              <button
                                className="btn-delete"
                                onClick={() => handleRemoveVariant(product.productId, variant.weight)}
                                title="Remove"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default Cart;