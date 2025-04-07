import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { logout } from "./userSlice"; // Ensure logout is an action creator

const host = import.meta.env.VITE_HOST || "http://localhost:8000";

// Async thunk to fetch cart properties
export const fetchCartProperties = createAsyncThunk(
    "cart/fetchCartProperties",
    async (user, { rejectWithValue }) => {
        try {
            if (!user?.role || !user?._id) {
                return rejectWithValue("User details are missing.");
            }

            if (user.role === "Admin") return [];

            const access_token = Cookies.get("access_token");
            const res = await fetch(`${host}/api/${user.role.toLowerCase()}/cartitems/${user._id}`, {
                method: "GET",
                headers: { Authorization: access_token },
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch cart properties.");
            }

            return data.cartItems || [];
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState = {
    cart: [],
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, { payload }) => {
            state.cart.push(payload);
        },
        removeFromCart: (state, { payload }) => {
            state.cart = state.cart.filter(item => item.id !== payload);
        },
        clearCart: (state) => {
            state.cart = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartProperties.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.cart = payload;
            })
            .addCase(fetchCartProperties.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(fetchCartProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.type, (state) => {
                state.cart = [];
            });
    },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
