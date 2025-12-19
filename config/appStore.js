import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import { loadCartFromStorage, initializeCartFromStorage } from "./cartSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
});

// Initialize cart from localStorage on app load
const savedCart = loadCartFromStorage();
if (savedCart.length > 0) {
  appStore.dispatch(initializeCartFromStorage(savedCart));
}

// Subscribe to Redux changes and persist cart to localStorage on every update
appStore.subscribe(() => {
  const state = appStore.getState();
  const cartItems = state.cart.items;
  try {
    localStorage.setItem("mkrfoods_cart", JSON.stringify(cartItems));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
});

export default appStore;
