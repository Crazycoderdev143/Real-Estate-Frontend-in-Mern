import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { logout } from "./userSlice"; // Import the logout action

const host = import.meta.env.VITE_HOST || "http://localhost:8000";
const access_token = Cookies.get("access_token");

// Async thunk to fetch cart properties
export const fetchCartProperties = createAsyncThunk(
    "cart/fetchCartProperties",
    async (user, { rejectWithValue }) => {
        try {
            if (!user || !user._id || !user.role) {
                return rejectWithValue("User details are missing.");
            }
            if (user.role === "Admin") {
                return
            }

            const response = await fetch(
                `${host}/api/${user.role.toLowerCase()}/cartitems/${user._id}`,
                {
                    method: "GET",
                    headers: { authorization: access_token },
                }
            );

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch cart properties.");
            }
            return data.cartItems || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    cart: [], // Initial cart should be an empty array
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            state.cart.push(action.payload); // Adding a new cart item
        },
        removeFromCart: (state, action) => {
            state.cart = state.cart.filter((item) => item.id !== action.payload); // Remove by ID
        },
        clearCart: (state) => {
            state.cart = []; // Empty the cart
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCartProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
            })
            .addCase(fetchCartProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logout, (state) => {
                state.cart = []; // Reset cart on logout
            });
    },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
