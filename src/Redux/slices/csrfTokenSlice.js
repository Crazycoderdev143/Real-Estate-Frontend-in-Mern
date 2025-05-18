import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    loading: false,
    error: null,
};

const csrfTokenSlice = createSlice({
    name: "csrfToken",
    initialState,
    reducers: {
        setCsrfToken: (state, action) => {
            state.token = action.payload;
            state.error = null;
        },
        clearCsrfToken: () => initialState,
        csrfTokenLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        csrfTokenSuccess: (state, action) => {
            state.token = action.payload;
            state.loading = false;
            state.error = null;
        },
        csrfTokenFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    setCsrfToken,
    clearCsrfToken,
    csrfTokenLoading,
    csrfTokenSuccess,
    csrfTokenFailure,
} = csrfTokenSlice.actions;

export default csrfTokenSlice.reducer;
