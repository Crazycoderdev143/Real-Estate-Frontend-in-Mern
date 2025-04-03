import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    currentUser: null, // Stores user information when logged in
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.currentUser = action.payload; // Payload contains user details
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.currentUser = null;
        },
    },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
