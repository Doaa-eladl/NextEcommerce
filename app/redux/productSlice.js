import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addToCart } from "./cartSlice";

// Thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const res = await fetch("http://localhost:4000/products", {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch products: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Listen for cart updates
      .addCase(addToCart.fulfilled, (state, action) => {
        const item = action.payload;
        const product = state.products.find((p) => p.id === item.id);
        if (product) {
          product.stock -= 1; // 🔥 instantly decrease stock in products state
        }
      });
  },
});

export default productSlice.reducer;
