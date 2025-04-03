import React from "react";
import "./index.css";
import App from "./App.jsx";
import {createRoot} from "react-dom/client";
import {persistor, store} from "./Redux/store.js";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import Alert from "./Components/Alert.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <App />
        <Alert />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
