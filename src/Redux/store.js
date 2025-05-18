import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist"
import csrfTokenReducer from "./slices/csrfTokenSlice";
import storage from "redux-persist/lib/storage";
import themeReducer from './slices/themeSlice';
import alertReducer from './slices/alertSlice';
import userReducer from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";

// Wrap all reducers here and combine them into a single rootReducer using combineReducers 
const rootReducer = combineReducers({
  user: userReducer, theme: themeReducer, alert: alertReducer, cart: cartReducer, csrfToken: csrfTokenReducer,
})

// Persist the rootReducer using redux-persist
const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create the store with the persisted reducer and the serializableCheck middleware disabled
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create the persistor
export const persistor = persistStore(store)