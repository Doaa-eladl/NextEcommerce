import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addToCart, updateQuantity } from "./cartSlice";

// --- LocalStorage Helpers ---
const PRODUCTS_KEY = "products";

const loadProducts = () => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

// --- Thunk for fetching products ---
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const local = loadProducts();
    if (local && local.length > 0) {
      return local; // ✅ keep stock from localStorage
    }

    // fetch only if no local products
    const res = await fetch("https://fakestoreapi.com/products");

    if (!res.ok) {
      throw new Error(
        `Failed to fetch products: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    // initialize with stock if needed
    const productsWithStock = data.map((p) => ({
      ...p,
      rating: {
        ...p.rating,
        count: p.rating?.count ?? 10, // ensure count exists
      },
    }));

    saveProducts(productsWithStock);
    return productsWithStock;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: loadProducts(),
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- fetchProducts ---
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
      // --- When item added to cart, update stock + save products ---
      .addCase(addToCart.fulfilled, (state, action) => {
        const addedCart = action.payload; // full updated cart
        const lastAdded = addedCart[addedCart.length - 1]; // last added item

        if (!lastAdded) return;

        const product = state.products.find((p) => p.id === lastAdded.id);
        if (product && product.rating.count > 0) {
          product.rating.count -= 1;
          saveProducts(state.products); // save updated products list
        }
      })
      // --- Update quantity fulfilled ---
      .addCase(updateQuantity.fulfilled, (state, action) => {
        if (action.meta.arg.type === "+") {
          state.products[action.meta.arg.product.id - 1].rating.count--;
        } else if (action.meta.arg.type === "-") {
          state.products[action.meta.arg.product.id - 1].rating.count++;
        } else if (action.meta.arg.type === "remove") {
          state.products[action.meta.arg.product.id - 1].rating.count +=
            action.meta.arg.product.quantity;
        }

        saveProducts(state.products);
      });
  },
});

export default productSlice.reducer;
