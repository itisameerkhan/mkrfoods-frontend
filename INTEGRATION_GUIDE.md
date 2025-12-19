# Cart System Integration Guide

## Quick Start

### 1. Verify Files Are Updated

Check these files have been updated:

```bash
✅ Frontend/config/cartSlice.js       # Redux slice with localStorage
✅ Frontend/config/appStore.js        # Store hydration & subscription
✅ Frontend/pages/Product/Product.jsx # Product add-to-cart dispatch
✅ Frontend/pages/Cart/Cart.jsx       # Full cart page (NEW)
✅ Frontend/pages/Cart/Cart.scss      # Cart styling (NEW)
✅ Frontend/CART_SYSTEM.md            # Complete documentation
```

### 2. Key Changes Summary

#### cartSlice.js

- **New item structure**: `{ productId, name, price, weight, quantity, image }`
- **Unique by**: `productId + weight` combination
- **New action**: `updateQuantity` (replaces old `updateCartQuantity`)
- **New function**: `loadCartFromStorage()` for hydration
- **Auto-sync**: All reducers call `persistCartToStorage()`

#### appStore.js

- **Hydration**: Loads cart from localStorage on app startup
- **Subscription**: Listens to all Redux changes and syncs to localStorage
- **Error handling**: Graceful fallback if localStorage unavailable

#### Product.jsx

- **Updated dispatch**: Now sends `{ productId, name, price, weight, image }`
- **Unique handling**: Adds product once per selected weight
- **Example**: Adding 2×250G + 1×500G = 2 separate cart items with qty tracking

#### Cart.jsx (NEW)

- **Full CRUD**: Add, update, remove, clear cart
- **Cart summary**: Subtotal, tax, total calculations
- **Responsive**: Mobile-optimized layout
- **User-friendly**: Empty state, quantity controls, delete buttons

---

## Usage in Your Components

### Adding to Cart (Product Page)

```javascript
import { useDispatch } from "react-redux";
import { addToCart } from "../../config/cartSlice";

const handleAddToCart = () => {
  const selectedWeights = [
    { size: 250, label: "250G", quantity: 2 },
    { size: 500, label: "500G", quantity: 1 },
  ];

  selectedWeights.forEach((w) => {
    // Add each quantity one by one (to increment properly)
    for (let i = 0; i < w.quantity; i++) {
      dispatch(
        addToCart({
          productId: product.id,
          name: product.name,
          price: product[`price_${w.size}`],
          weight: w.label,
          image: product.imageURL,
        })
      );
    }
  });
};
```

### Viewing Cart Items (Any Component)

```javascript
import { useSelector } from "react-redux";

const cartItems = useSelector((state) => state.cart.items);
const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
const cartTotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

console.log(`${itemCount} items in cart`);
console.log(`Total: ₹${cartTotal}`);
```

### Managing Cart Items (Cart Page)

```javascript
import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../config/cartSlice";

// Remove item
dispatch(removeFromCart({ productId: "prod_1", weight: "250G" }));

// Update quantity
dispatch(updateQuantity({ productId: "prod_1", weight: "250G", quantity: 5 }));

// Clear entire cart
dispatch(clearCart());
```

---

## Testing the Implementation

### Test Scenario 1: Basic Add to Cart

```
1. Open Product page
2. Select 250G weight, click "Add to Cart"
3. Check browser DevTools → Application → localStorage
4. Should see entry: mkrfoods_cart = [{"productId":"...", "weight":"250G", "quantity":1, ...}]
5. Refresh page → Cart should persist ✅
```

### Test Scenario 2: Duplicate Add (Same Weight)

```
1. Add Chicken Masala 250G (qty becomes 1)
2. Add Chicken Masala 250G again (qty should become 2)
3. localStorage should still have 1 item with quantity: 2 ✅
```

### Test Scenario 3: Different Weights

```
1. Add Chicken Masala 250G (qty: 1)
2. Add Chicken Masala 500G (qty: 1)
3. localStorage should have 2 separate items ✅
4. Cart page should show as 2 distinct items
```

### Test Scenario 4: Persistence Across Tabs

```
1. Open cart page in Tab 1
2. Add product in Tab 1
3. Open Tab 2 and refresh
4. Alternatively: Tab 2 should have same cart (localStorage shared) ✅
```

---

## localStorage Structure Example

After adding:

- Spicy Chicken Masala 250G (qty: 2)
- Paneer Butter Masala 500G (qty: 1)

localStorage contains:

```json
{
  "mkrfoods_cart": [
    {
      "productId": "prod_001",
      "name": "Spicy Chicken Masala",
      "price": 120,
      "weight": "250G",
      "quantity": 2,
      "image": "https://..."
    },
    {
      "productId": "prod_003",
      "name": "Paneer Butter Masala",
      "price": 100,
      "weight": "500G",
      "quantity": 1,
      "image": "https://..."
    }
  ]
}
```

---

## Redux State Structure

In Redux DevTools, you'll see:

```javascript
cart: {
  items: [
    {
      productId: "prod_001",
      name: "Spicy Chicken Masala",
      price: 120,
      weight: "250G",
      quantity: 2,
      image: "https://..."
    },
    // ... more items
  ],
  productSelections: {
    "prod_123": { 250: 2, 500: 0, 1000: 0 },  // Product page form state
    // ... for each product viewed
  }
}
```

---

## Common Issues & Fixes

### Issue: "Cannot find module 'cartSlice'"

**Fix**: Ensure imports use correct path

```javascript
import { addToCart } from "../../config/cartSlice";
```

### Issue: Cart not persisting after reload

**Fix 1**: Check localStorage is enabled (not in private mode)
**Fix 2**: Verify `appStore.js` has subscription code
**Fix 3**: Open DevTools → Application → localStorage and verify data exists

### Issue: Duplicate items in cart

**Fix**: Ensure you're checking both `productId` AND `weight` as the unique key

```javascript
// Wrong (only checks productId)
const exists = state.items.find((i) => i.productId === productId);

// Correct (checks productId + weight)
const exists = state.items.find(
  (i) => i.productId === productId && i.weight === weight
);
```

### Issue: localStorage quota exceeded

**Fix**: Clear old cart data or implement cart cleanup

```javascript
// Manual clear
localStorage.removeItem("mkrfoods_cart");

// Or dispatch action
dispatch(clearCart());
```

---

## Performance Tips

### 1. Use Redux Selector Hooks

```javascript
// ✅ Good - memoized
const itemCount = useSelector((state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

// ❌ Avoid - creates new function on every render
const itemCount = useSelector((state) => {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
});
```

### 2. Add Cart Badge to Header

```javascript
// In Header.jsx
const itemCount = useSelector((state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

return (
  <i className="fas fa-shopping-cart">
    {itemCount > 0 && <span className="badge">{itemCount}</span>}
  </i>
);
```

### 3. Lazy Load Cart.jsx

```javascript
// In router config
import { lazy, Suspense } from "react";

const Cart = lazy(() => import("./pages/Cart/Cart"));

// In route
<Suspense fallback={<div>Loading...</div>}>
  <Route path="/cart" element={<Cart />} />
</Suspense>;
```

---

## Next Steps

1. **Test thoroughly** - Follow test scenarios above
2. **Add cart badge** - Show item count in header
3. **Link product to cart** - Ensure navigation works
4. **Implement checkout** - Create order form
5. **Add payment gateway** - Razorpay, Stripe, etc.
6. **Set up backend** - Create orders API endpoint

---

## File Reference

| File                        | Purpose                         | Status     |
| --------------------------- | ------------------------------- | ---------- |
| `config/cartSlice.js`       | Redux cart logic + localStorage | ✅ Updated |
| `config/appStore.js`        | Store config + hydration        | ✅ Updated |
| `pages/Product/Product.jsx` | Product page with add-to-cart   | ✅ Updated |
| `pages/Cart/Cart.jsx`       | Cart page component             | ✅ NEW     |
| `pages/Cart/Cart.scss`      | Cart page styling               | ✅ NEW     |
| `CART_SYSTEM.md`            | Full documentation              | ✅ NEW     |

---

**Implementation Date**: December 19, 2025  
**Status**: Ready for Testing ✅
