import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// --- Utility helpers for localStorage ---
const CART_KEY = "cartItems";

const loadCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
};

// --- Thunks ---
// Load cart from localStorage
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  return loadCart();
});

// Add product to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { getState }) => {
    const state = getState().cart.items;
    const existing = state.find((item) => item.id === product.id);

    let updatedCart;
    if (existing) {
      updatedCart = state.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...state, { ...product, quantity: 1 }];
    }

    saveCart(updatedCart);
    return updatedCart;
  }
);

// Update quantity (+ / - / remove)
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ type, product }, { getState }) => {
    const state = getState().cart.items;

    let updatedCart = state.map((item) => {
      if (item.id !== product.id) return item;

      if (type === "+") {
        return { ...item, quantity: item.quantity + 1 };
      } else if (type === "-" && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      } else if (type === "-" || type === "remove") {
        return null; // mark for removal
      }

      return item;
    });

    // filter out removed items
    updatedCart = updatedCart.filter(Boolean);

    saveCart(updatedCart);
    return updatedCart;
  }
);

// --- Slice ---
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default cartSlice.reducer;
