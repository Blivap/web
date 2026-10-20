"use client";

import { useEffect } from "react";
import { isNetworkFailure } from "@/lib/api/networkFailure";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const network = isNetworkFailure(error);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !network) {
      console.error(error);
    }
  }, [error, network]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#F8F8F8",
          color: "#100F14",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 16,
            border: "1px solid #E8E6E3",
            background: "#fff",
            padding: 24,
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#960018",
            }}
          >
            Blivap
          </p>
          <h1 style={{ margin: "12px 0 0", fontSize: 20, fontWeight: 700 }}>
            {network ? "Can't reach Blivap" : "Something went wrong"}
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.5, color: "#49475A" }}>
            {network
              ? "We couldn’t reach the server. Check your connection or try again."
              : "An unexpected error stopped the app. You can try again."}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: 8,
                background: "#960018",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                borderRadius: 8,
                border: "1px solid #E8E6E3",
                background: "#fff",
                color: "#100F14",
                fontWeight: 600,
                fontSize: 13,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
