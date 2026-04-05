/**
 * Minimal Web Push handler. Payload shape should mirror in-app rows (title, body, data).
 * `data` values are strings (per backend); we pass through for notificationclick routing.
 */

self.addEventListener("push", function (event) {
  let title = "Blivap";
  let body = "";
  /** @type {Record<string, string>} */
  let data = {};

  if (event.data) {
    try {
      const json = event.data.json();
      title = json.title || title;
      body = json.body || "";
      if (json.data && typeof json.data === "object") {
        data = /** @type {Record<string, string>} */ (json.data);
      }
    } catch {
      body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
    }),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const d = event.notification.data || {};

  /** @type {string} */
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
      path = d.bookingId ? `/bookings?bookingId=${encodeURIComponent(d.bookingId)}` : "/bookings";
    } else if (type === "donor_matched") {
      path = d.donorId
        ? `/donors/${encodeURIComponent(d.donorId)}`
        : "/bookings";
    } else if (
      type === "verification_approved" ||
      type === "verification_rejected"
    ) {
      path = "/verify-id";
    }
  }

  const targetUrl = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const c = clientList[i];
        if (c.url.startsWith(self.location.origin) && "focus" in c) {
          return c.focus().then(function () {
            c.postMessage({ type: "blivap-notification-navigate", href: path });
          });
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
