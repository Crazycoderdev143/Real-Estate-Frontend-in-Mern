importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD-B4mS9VJSaadV7UYPV0zXB3nV4QH58jQ",
    authDomain: "mern-real-estate-c10c6.firebaseapp.com",
    projectId: "mern-real-estate-c10c6",
    storageBucket: "mern-real-estate-c10c6.appspot.com",
    messagingSenderId: "617214963543",
    appId: "1:617214963543:web:8a1c0e1fb7feeea7425812"
};

// ✅ Initialize Firebase only if needed
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

// ✅ Allowed domains for click actions (prevents click hijacking)
const ALLOWED_DOMAINS = ["https://yourdomain.com"];

// 📌 Handle Background Messages
messaging.onBackgroundMessage(async (payload) => {
    console.log("[Firebase SW] Background message received:", payload);

    const title = payload.notification?.title || "New Notification";
    const body = payload.notification?.body || "You have a new message!";
    const icon = payload.notification?.image || "/default-icon.png";

    // ✅ Validate `click_action` to prevent phishing attacks
    let clickAction = payload.data?.click_action || "/";
    const url = new URL(clickAction, self.location.origin);
    if (!ALLOWED_DOMAINS.includes(url.origin)) {
        console.warn("[Security] Unauthorized click_action URL:", clickAction);
        clickAction = "/";
    }

    // ✅ Notification Options
    const notificationOptions = {
        body,
        icon,
        badge: "/badge-icon.png",
        data: { clickAction },
        requireInteraction: true,
        actions: [{ action: "open_url", title: "View" }]
    };

    // ✅ Show Notification
    await self.registration.showNotification(title, notificationOptions);
});

// 📌 Handle Notification Click
self.addEventListener("notificationclick", async (event) => {
    event.notification.close();
    const { clickAction } = event.notification.data;

    if (clickAction) {
        event.waitUntil(
            clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
                for (let client of windowClients) {
                    if (client.url === clickAction && "focus" in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(clickAction);
            })
        );
    }
});

// 📌 Handle Notification Close Event (optional logging)
self.addEventListener("notificationclose", async (event) => {
    console.log("[Firebase SW] Notification closed:", event.notification);
});