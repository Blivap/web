/**
 * Firebase Cloud Messaging service worker (web).
 * Compat scripts must stay aligned with the `firebase` package major/minor.
 */
/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAkMPJRD4zBM5oDNtiOZT1IMP-diE2iRwY",
  authDomain: "blivap.firebaseapp.com",
  projectId: "blivap",
  messagingSenderId: "935287391630",
  appId: "1:935287391630:web:b08cc67c0abbf2090e90df",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const data = payload.data || {};
  const title =
    (payload.notification && payload.notification.title) ||
    data.title ||
    "Blivap";
  const body =
    (payload.notification && payload.notification.body) || data.body || "";
  const icon =
    (payload.notification && payload.notification.icon) || "/icon1.png";

  return self.registration.showNotification(title, {
    body: body,
    data: data,
    icon: icon,
    badge: "/icon1.png",
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const d = event.notification.data || {};

  let path = "/overview";
  if (typeof d.url === "string" && d.url.startsWith("/")) {
    path = d.url;
  } else {
    const type = d.type || "";
    if (
      type === "booking_request_sent" ||
      type === "booking_accepted" ||
      type === "booking_rejected"
    ) {
      path = d.bookingId
        ? "/bookings?bookingId=" + encodeURIComponent(d.bookingId)
        : "/bookings";
    } else if (type === "donor_matched") {
      path = d.donorId ? "/donors/" + encodeURIComponent(d.donorId) : "/bookings";
    } else if (
      type === "verification_approved" ||
      type === "verification_rejected"
    ) {
      path = "/verify-id";
    }
  }

  const targetUrl = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const c = clientList[i];
          if (c.url.startsWith(self.location.origin) && "focus" in c) {
            return c.focus().then(function () {
              c.postMessage({
                type: "blivap-notification-navigate",
                href: path,
              });
            });
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
