import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../../config/cartSlice";
import "./Cart.scss";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);

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

  // Calculate totals - now iterating through variants
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

  useEffect(() => {
    // Re-render cart when Redux state updates
    console.log("Cart updated:", cartItems);
  }, [cartItems]);

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
        <h1>Shopping Cart</h1>

        <div className="cart-layout">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="cart-header">
              <div className="item-count">
                {itemCount} {itemCount === 1 ? "item" : "items"} in cart
              </div>
              <button
                className="btn-clear-cart"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
            </div>

            <div className="items-list">
              {cartItems.map((product) => (
                <div key={product.productId} className="cart-product">
                  {/* Product Header */}
                  <div className="product-header">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                    </div>
                  </div>

                  {/* Product Variants */}
                  <div className="product-variants">
                    {product.variants.map((variant) => (
                      <div key={`${product.productId}_${variant.weight}`} className="cart-item">
                        <div className="item-details">
                          <div className="item-weight">
                            <span className="label">Size:</span>
                            <span className="value">{variant.weight}</span>
                          </div>
                          <div className="item-price">
                            <span className="label">Price:</span>
                            <span className="value">₹ {variant.price}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="quantity-controls">
                          <button
                            className="qty-btn minus"
                            onClick={() => handleQuantityChange(product.productId, variant.weight, variant.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="qty-input"
                            value={variant.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              handleQuantityChange(product.productId, variant.weight, val);
                            }}
                            min="1"
                          />
                          <button
                            className="qty-btn plus"
                            onClick={() => handleQuantityChange(product.productId, variant.weight, variant.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="item-subtotal">
                          <span className="subtotal-label">Subtotal:</span>
                          <span className="subtotal-value">₹ {(variant.price * variant.quantity).toFixed(2)}</span>
                        </div>

                        {/* Remove Variant Button */}
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveVariant(product.productId, variant.weight)}
                          aria-label="Remove from cart"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Product Total Price - New Section */}
                  <div className="product-total">
                    <span className="label">Total Price:</span>
                    <span className="value">₹ {product.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary Section */}
            <div className="cart-summary">
              <div className="summary-header">
                <h2>Order Summary</h2>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span className="label">Subtotal:</span>
                  <span className="value">₹ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Shipping:</span>
                  <span className="value free">FREE</span>
                </div>
                <div className="summary-row">
                  <span className="label">Tax (estimated):</span>
                  <span className="value">₹ {(cartTotal * 0.05).toFixed(2)}</span>
                </div>
                <hr className="divider" />
                <div className="summary-row total">
                  <span className="label">Total:</span>
                  <span className="value">₹ {(cartTotal + cartTotal * 0.05).toFixed(2)}</span>
                </div>
              </div>

              <button className="btn-checkout">
                Proceed to Checkout
              </button>

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