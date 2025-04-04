import "./index.css";
import React from "react";
import App from "./App.jsx";
import {Provider} from "react-redux";
import Alert from "./Components/Alert.jsx";
import {createRoot} from "react-dom/client";
import {persistor, store} from "./Redux/store.js";
import {PersistGate} from "redux-persist/integration/react";

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
