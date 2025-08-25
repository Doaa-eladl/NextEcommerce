import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:4000";

// ✅ Thunk for fetching the whole cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        next: { revalidate: 0 }, // disable cache
      });

      if (!res.ok) {
        throw new Error("Failed to fetch cart items");
      }

      return await res.json(); // this will be an array of cart items
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk for adding to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (productToAdd, { rejectWithValue }) => {
    try {
      // 1. Get current cart
      const cartRes = await fetch(`${API_BASE}/cart`);
      if (!cartRes.ok) throw new Error("Failed to fetch cart items");
      const cartItems = await cartRes.json();

      const existingItem = cartItems.find(
        (item) => item.id === productToAdd.id
      );

      // 2. Update or add item
      const cartItem = {
        ...productToAdd,
        stock: productToAdd.stock - 1,
        quantity: (existingItem?.quantity || 0) + 1,
      };

      const cartUpdateRes = await fetch(
        `${API_BASE}/cart${existingItem ? `/${existingItem.id}` : ""}`,
        {
          method: existingItem ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartItem),
        }
      );

      if (!cartUpdateRes.ok) {
        throw new Error(
          `Failed to ${existingItem ? "update" : "add"} cart item`
        );
      }

      // 3. Decrease product stock
      const productRes = await fetch(`${API_BASE}/products/${productToAdd.id}`);
      const product = await productRes.json();
      if (product.stock <= 0) throw new Error("Product is out of stock");

      const updatedStock = { ...product, stock: product.stock - 1 };

      const stockRes = await fetch(`${API_BASE}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStock),
      });

      if (!stockRes.ok) throw new Error("Failed to update product stock");

      // Return updated cart item (so it can be added in state)
      return cartItem;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Utility API functions
const getItem = async (endpoint, id) => {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint} with id ${id}`);
  return await res.json();
};

const updateItem = async (endpoint, id, data) => {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${endpoint} with id ${id}`);
  return await res.json();
};

const deleteItem = async (endpoint, id) => {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to delete ${endpoint} with id ${id}`);
};

// 🔥 Thunk for updating cart quantity
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ type, cartProduct }, { rejectWithValue }) => {
    try {
      const cartItem = await getItem("cart", cartProduct.id);
      const product = await getItem("products", cartProduct.id);

      if (type === "+") {
        if (product.stock <= 0) throw new Error("Product is out of stock");

        await updateItem("cart", cartProduct.id, {
          ...cartItem,
          stock: cartItem.stock - 1,
          quantity: cartItem.quantity + 1,
        });

        await updateItem("products", product.id, {
          ...product,
          stock: product.stock - 1,
        });
      } else if (
        (type === "-" && cartProduct.quantity === 1) ||
        type === "remove"
      ) {
        await deleteItem("cart", cartProduct.id);

        await updateItem("products", product.id, {
          ...product,
          stock: product.stock + cartProduct.quantity,
        });
      } else if (type === "-") {
        await updateItem("cart", cartProduct.id, {
          ...cartItem,
          stock: cartItem.stock + 1,
          quantity: cartItem.quantity - 1,
        });

        await updateItem("products", product.id, {
          ...product,
          stock: product.stock + 1,
        });
      }

      return { type, cartProduct };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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
      // ✅ Handle fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Handle addToCart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          existing.quantity += 1;
          existing.stock -= 1;
        } else {
          state.items.push(item);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Handle updateCart
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;

        const { type, cartProduct } = action.payload;
        const existing = state.items.find((i) => i.id === cartProduct.id);

        if (type === "+") {
          if (existing) {
            existing.quantity += 1;
            existing.stock -= 1;
          }
        } else if (
          (type === "-" && cartProduct.quantity === 1) ||
          type === "remove"
        ) {
          state.items = state.items.filter((i) => i.id !== cartProduct.id);
        } else if (type === "-") {
          if (existing) {
            existing.quantity -= 1;
            existing.stock += 1;
          }
        }
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
