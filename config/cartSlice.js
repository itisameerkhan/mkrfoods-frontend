import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "mkrfoods_cart";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [], // Each item: { productId, name, image, variants: [{weight, price, quantity}, ...] }
    },
    reducers: {
        // Add product variant to cart or update if exists
        addToCart: (state, action) => {
            const { productId, name, image, weight, price, quantity } = action.payload;
            const productIndex = state.items.findIndex(p => p.productId === productId);

            if (productIndex !== -1) {
                const product = state.items[productIndex];
                const variantIndex = product.variants.findIndex(v => v.weight === weight);

                if (variantIndex !== -1) {
                    // Update the quantity for the specific variant
                    product.variants[variantIndex].quantity = quantity;
                } else {
                    // Add the new variant
                    product.variants.push({ weight, price, quantity });
                }

                // Calculate total price for the product
                product.totalPrice = product.variants.reduce((sum, v) => sum + v.price * v.quantity, 0);

                // Update maxQuantity if provided
                if (action.payload.maxQuantity !== undefined) {
                    product.maxQuantity = action.payload.maxQuantity;
                }
                
                // Update the product in the cart
                state.items[productIndex] = product;
            } else {
                // Add the new product with the variant
                state.items.push({
                    productId,
                    name,
                    image,
                    maxQuantity: action.payload.maxQuantity || 0, // Store max quantity
                    variants: [{ weight, price, quantity }],
                    totalPrice: price * quantity,
                });
            }

            // Persist to localStorage
            persistCartToStorage(state.items);
        },

        // Remove variant from product, or remove product if no variants left
        removeFromCart: (state, action) => {
            const { productId, weight } = action.payload;
            const productIndex = state.items.findIndex(p => p.productId === productId);

            if (productIndex !== -1) {
                const product = state.items[productIndex];
                product.variants = product.variants.filter(v => v.weight !== weight);

                // Remove product if no variants left
                if (product.variants.length === 0) {
                    state.items.splice(productIndex, 1);
                }
            }

            persistCartToStorage(state.items);
        },

        // Update quantity for a specific variant
        updateQuantity: (state, action) => {
            const { productId, weight, quantity } = action.payload;
            const productIndex = state.items.findIndex(p => p.productId === productId);

            if (productIndex !== -1) {
                const product = state.items[productIndex];
                const variantIndex = product.variants.findIndex(v => v.weight === weight);

                if (variantIndex !== -1) {
                    // Replace the quantity directly
                    product.variants[variantIndex].quantity = quantity;
                }

                // Update the product in the cart
                state.items[productIndex] = product;
            }

            persistCartToStorage(state.items);
        },

        // Clear all cart items
        clearCart: (state) => {
            state.items = [];
            persistCartToStorage([]);
        },

        // Initialize cart from localStorage (called on app load)
        initializeCartFromStorage: (state, action) => {
            state.items = action.payload || [];
        },
    },
});

// Utility function to persist cart to localStorage
const persistCartToStorage = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
    }
};

// Utility function to load cart from localStorage
export const loadCartFromStorage = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        return [];
    }
};

export const { addToCart, removeFromCart, clearCart, updateQuantity, initializeCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
