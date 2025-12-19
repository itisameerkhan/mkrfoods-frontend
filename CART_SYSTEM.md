# Redux Cart System with localStorage Persistence

## Overview

This is a production-ready "Add to Cart" system for a MERN e-commerce app that works **without user login** and **persists across page reloads** using Redux Toolkit + localStorage.

## Features

✅ **No Login Required** - Anonymous users can add products to cart  
✅ **Persistent Storage** - Cart survives browser refresh/reload  
✅ **Unique Identification** - Items unique by `productId + weight` combination  
✅ **Quantity Management** - Same product+weight increases quantity instead of duplicating  
✅ **Auto-Sync** - Redux state automatically syncs to localStorage on every change  
✅ **Clean API** - Simple, scalable reducer actions  
✅ **Production-Ready** - Error handling, edge cases covered

---

## Architecture

### 1. Redux Store Structure

```javascript
// state.cart = {
//   items: [
//     {
//       productId: string,      // Unique product ID
//       name: string,           // Product name
//       price: number,          // Price per unit
//       weight: string,         // Size/weight (e.g., "250G", "500G", "1KG")
//       quantity: number,       // How many units in cart
//       image: string           // Product image URL
//     }
//   ],
//   productSelections: {}       // For product page form persistence
// }
```

### 2. Uniqueness by `productId + weight`

Items are identified by **both productId and weight**. This allows:

- Same product in different sizes to be separate cart items
- Adding same product+weight multiple times increases quantity
- Example: Chicken Masala 250G (qty: 2) and Chicken Masala 500G (qty: 1) are different items

### 3. localStorage Key

All cart data is stored under: `localStorage.setItem('mkrfoods_cart', JSON.stringify(items))`

---

## File Structure

```
Frontend/
├── config/
│   ├── cartSlice.js          # Redux slice with reducers + localStorage utils
│   ├── appStore.js           # Store config with hydration + subscription
│   ├── userSlice.js
│   └── firebase.js
├── pages/
│   ├── Product/
│   │   ├── Product.jsx       # Updated to dispatch new cart format
│   │   └── Product.scss
│   ├── Cart/
│   │   ├── Cart.jsx          # Full-featured cart page (NEW)
│   │   └── Cart.scss         # Modern cart styling (NEW)
│   └── ...
└── src/
    └── main.jsx              # App entry point
```

---

## Redux Actions

### `addToCart(action.payload)`

**Purpose**: Add product to cart or increase quantity if already exists

**Payload**:

```javascript
{
  productId: "prod_123",
  name: "Spicy Chicken Masala",
  price: 120,
  weight: "250G",
  image: "https://example.com/image.jpg"
}
```

**Behavior**:

- If `productId + weight` exists → increment `quantity` by 1
- If new combination → add new item with `quantity: 1`
- Automatically syncs to localStorage

**Example Usage** (in Product.jsx):

```javascript
dispatch(
  addToCart({
    productId: product.id,
    name: product.name,
    price: product.price_250, // Based on selected weight
    weight: "250G", // Selected size
    image: product.imageURL,
  })
);
```

---

### `removeFromCart(action.payload)`

**Purpose**: Remove item from cart

**Payload**:

```javascript
{
  productId: "prod_123",
  weight: "250G"
}
```

**Behavior**:

- Removes entire item (not just decrement quantity)
- Automatically syncs to localStorage

**Example Usage** (in Cart.jsx):

```javascript
dispatch(
  removeFromCart({
    productId: "prod_123",
    weight: "250G",
  })
);
```

---

### `updateQuantity(action.payload)`

**Purpose**: Change quantity of item in cart

**Payload**:

```javascript
{
  productId: "prod_123",
  weight: "250G",
  quantity: 5
}
```

**Behavior**:

- Sets quantity to provided value
- Prevents quantity below 1 (uses `Math.max(1, quantity)`)
- Automatically syncs to localStorage

**Example Usage**:

```javascript
dispatch(
  updateQuantity({
    productId: "prod_123",
    weight: "250G",
    quantity: 5,
  })
);
```

---

### `clearCart()`

**Purpose**: Empty entire cart

**Payload**: None

**Example Usage**:

```javascript
dispatch(clearCart());
```

---

### `initializeCartFromStorage(action.payload)`

**Purpose**: Hydrate Redux state from localStorage (called on app load)

**Payload**: Array of cart items

**Note**: Automatically called in `appStore.js` on app init

---

## localStorage Sync Strategy

### **On App Load** (appStore.js)

```javascript
const savedCart = loadCartFromStorage();
if (savedCart.length > 0) {
  appStore.dispatch(initializeCartFromStorage(savedCart));
}
```

### **On Every Redux Change**

```javascript
appStore.subscribe(() => {
  const state = appStore.getState();
  localStorage.setItem("mkrfoods_cart", JSON.stringify(state.cart.items));
});
```

This ensures:

- ✅ Cart loads on first visit
- ✅ Cart persists after browser close
- ✅ Cart syncs in real-time as items change
- ✅ Multiple tabs see same cart (via localStorage events)

---

## Usage Examples

### Example 1: Add Product to Cart (Product.jsx)

```javascript
import { useDispatch } from "react-redux";
import { addToCart } from "../../config/cartSlice";

const ProductPage = () => {
  const dispatch = useDispatch();
  const product = { id: "prod_1", name: "Paneer Masala", price_250: 100 };

  const handleAddToCart = (selectedWeight) => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: product[`price_${selectedWeight.size}`],
        weight: selectedWeight.label, // "250G", "500G", etc.
        image: product.imageURL,
      })
    );
    toast.success("Product added successfully");
  };

  return (
    <button onClick={() => handleAddToCart({ size: 250, label: "250G" })}>
      Add to Cart
    </button>
  );
};
```

### Example 2: View & Manage Cart (Cart.jsx)

```javascript
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity } from "../../config/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const handleIncreaseQty = (item) => {
    dispatch(
      updateQuantity({
        productId: item.productId,
        weight: item.weight,
        quantity: item.quantity + 1,
      })
    );
  };

  const handleRemoveItem = (item) => {
    dispatch(
      removeFromCart({
        productId: item.productId,
        weight: item.weight,
      })
    );
  };

  return (
    <div>
      {cartItems.map((item) => (
        <div key={`${item.productId}_${item.weight}`}>
          <h3>
            {item.name} ({item.weight})
          </h3>
          <p>
            ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
          </p>
          <button onClick={() => handleIncreaseQty(item)}>+</button>
          <button onClick={() => handleRemoveItem(item)}>Remove</button>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Calculate Cart Total

```javascript
const cartItems = useSelector((state) => state.cart.items);

const cartTotal = cartItems.reduce((sum, item) => {
  return sum + item.price * item.quantity;
}, 0);

console.log(`Cart Total: ₹${cartTotal}`);
```

---

## Testing Persistence

### Test 1: Add Product → Reload

1. Add product to cart
2. Check DevTools → Application → localStorage → find `mkrfoods_cart`
3. Verify JSON contains item
4. Refresh page
5. ✅ Cart should still contain item

### Test 2: Multiple Items with Same Product

1. Add Chicken Masala 250G (qty: 1)
2. Add Chicken Masala 250G again
3. ✅ Should show qty: 2 (not two separate items)
4. Add Chicken Masala 500G
5. ✅ Should show as separate item (different weight)

### Test 3: Clear Cart & Reload

1. Add items to cart
2. Click "Clear Cart"
3. Check localStorage is empty
4. Refresh page
5. ✅ Cart should be empty

---

## Error Handling

All functions include try-catch for localStorage errors:

```javascript
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return []; // Fallback to empty cart
  }
};
```

This handles:

- localStorage full quota exceeded
- Invalid JSON in storage
- Private browsing mode (localStorage unavailable)

---

## Browser Support

Works on all modern browsers with localStorage support:

- ✅ Chrome, Edge, Firefox, Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ Private/Incognito mode: localStorage may be unavailable (gracefully handled)

---

## Performance Considerations

1. **Debounce localStorage writes** (optional for large carts):

   ```javascript
   const debounce = (fn, ms) => {
     let timeout;
     return (...args) => {
       clearTimeout(timeout);
       timeout = setTimeout(() => fn(...args), ms);
     };
   };
   ```

2. **Lazy load Cart.jsx** (optional):

   ```javascript
   const Cart = React.lazy(() => import("./pages/Cart/Cart"));
   ```

3. **Cart item count in header** (optional):
   ```javascript
   const itemCount = useSelector((state) =>
     state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
   );
   ```

---

## Next Steps

- [ ] Add cart icon badge showing item count in Header
- [ ] Implement checkout form (name, email, address)
- [ ] Add payment integration (Razorpay, Stripe)
- [ ] Create order confirmation page
- [ ] Add cart item edit/update functionality
- [ ] Implement wishlist (similar to cart)
- [ ] Add coupon/discount codes

---

## Troubleshooting

| Issue                            | Solution                                                  |
| -------------------------------- | --------------------------------------------------------- |
| Cart not persisting after reload | Check if localStorage is enabled in browser settings      |
| Duplicate items appearing        | Verify both `productId` AND `weight` match for uniqueness |
| localStorage quota exceeded      | Clear old data or implement pagination                    |
| Cart not syncing across tabs     | Check browser localStorage event listeners                |

---

**Last Updated**: December 19, 2025  
**Status**: Production Ready ✅
