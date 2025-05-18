import {publicRoutes, sharedRoutes, agentRoutes, adminRoutes} from "./routes";
import {messaging, getToken, onMessage} from "./services/firebase";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import React, {Suspense, useEffect, useState} from "react";
import {
  csrfTokenLoading,
  csrfTokenSuccess,
  csrfTokenFailure,
} from "./Redux/slices/csrfTokenSlice";
import ErrorBoundary from "./Components/ErrorBoundary";
import FeedbackPopup from "./Components/FeedbackPopup";
import {showAlert} from "./Redux/slices/alertSlice";
import Loading from "./Components/Loading";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import {useDispatch, useSelector} from "react-redux";

const App = () => {
  const host = import.meta.env.VITE_HOST; // Environment variable
  const [showPopup, setShowPopup] = useState(false);
  const {isLoggedIn} = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const hasSeenProperty = localStorage.getItem(`viewed`);
  const sentFeedback = localStorage.getItem(`sentFeedback`);

  useEffect(() => {
    if (!sentFeedback && hasSeenProperty) {
      const timer = setTimeout(() => setShowPopup(true), 10 * 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenProperty, sentFeedback]);

  // Function to send FCM token to the backend
  const sendTokenToBackend = async (token) => {
    try {
      const res = await fetch(`${host}api/user/reg-notify-token`, {
        method: "POST",
        credentials: "include", // Needed to send cookies
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({token}),
      });

      const data = await res.json();
      if (data.success) {
        dispatch(showAlert({message: data.message, type: "success"}));
      } else if (!data.message.includes("already")) {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error.message, type: "error"}));
      console.error("Error sending token to backend:", error);
    }
  };

  // Function to request notification permissions and fetch token
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      // Store and send token only if it has changed
      const storedToken = localStorage.getItem("fcm_token");
      if (token && token !== storedToken) {
        localStorage.setItem("fcm_token", token);
        sendTokenToBackend(token);
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };

  // Handle incoming notifications
  const handleIncomingMessage = (payload) => {
    try {
      console.log("Message received:", payload);

      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body || "You have a new message.";
      const icon = payload.notification?.image || "/default-icon.png";
      const {type, url, imageUrl} = payload.data || {};

      const notificationOptions = {
        body,
        icon,
        data: {imageUrl, type, url, title},
      };

      const notification = new Notification(title, notificationOptions);
      notification.onclick = (event) => {
        event.preventDefault();
        if (url?.startsWith("https://")) {
          window.open(url, "_blank");
        }
      };
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const fetchCsrfToken = async () => {
    dispatch(csrfTokenLoading());
    try {
      const res = await fetch(`${host}/api/user/csrf-token`, {
        method: "GET",
        credentials: "include", // important: includes cookies
      });
      if (!res.ok) throw new Error("Failed to fetch CSRF token");
      const {csrfToken} = await res.json();
      dispatch(csrfTokenSuccess(csrfToken));
    } catch (err) {
      dispatch(csrfTokenFailure(err.message));
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, [isLoggedIn]);

  useEffect(() => {
    requestPermission();
    onMessage(messaging, handleIncomingMessage);
    fetchCsrfToken();
  }, []);

  return (
    <BrowserRouter
      future={{v7_relativeSplatPath: true, v7_startTransition: true}}
    >
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Header />
          {showPopup && <FeedbackPopup />}
          <Routes>
            {[
              ...publicRoutes,
              ...sharedRoutes,
              ...agentRoutes,
              ...adminRoutes,
            ].map((route) => (
              <Route
                key={route.path}
                {...route}
              />
            ))}
          </Routes>
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;

// performance optimization, efficiency, maintainability, readability and security
