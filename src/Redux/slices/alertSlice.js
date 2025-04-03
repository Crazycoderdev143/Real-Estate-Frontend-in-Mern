import { createSlice } from "@reduxjs/toolkit";

const alertSlice = createSlice({
    name: "alert",
    initialState: {
        show: false,
        message: "",
        type: "info", // "success", "error", "warning", "info"
    },
    reducers: {
        showAlert: (state, action) => {
            state.show = true;
            state.message = action.payload.message;
            state.type = action.payload.type || "info";
        },
        hideAlert: (state) => {
            state.show = false;
            state.message = "";
            state.type = "info";
        },
    },
});

export const { showAlert, hideAlert } = alertSlice.actions;

export default alertSlice.reducer;
