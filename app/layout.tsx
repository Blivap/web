import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import { SnackbarProvider } from "./components/snackbar/snackbar.context";
import { Snackbar } from "./components/snackbar/snackbar.component";
import config from "./utils/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const helvetica = localFont({
  variable: "--font-helvetica",
  src: [
    {
      path: "../public/fonts/helvetica/Helvetica.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/helvetica/Helvetica.woff",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});
const { url, env } = config();

export const metadata: Metadata = {
  title: "Blivap — Give Blood. Save Lives.",
  description:
    "Blivap connects blood donors with people in need, promoting health, compassion, and life-saving support across communities.",
  openGraph: {
    title: "Blivap — Give Blood. Save Lives.",
    description:
      "Join Blivap to donate blood, help others, and support healthy living. Every donation makes a difference.",
    url: "https://blivap.com", // change to your real domain
    siteName: "Blivap",
    images: [
      {
        url: "/og-image.png", // 1200x630 recommended
        width: 1200,
        height: 630,
        alt: "Blivap — Blood Donation Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blivap — Give Blood. Save Lives.",
    description:
      "A blood donation platform focused on care, health, and saving lives.",
    images: [
      `${env === "development" ? "http://localhost:3000" : url}/api/og?title=Blivap`,
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Blivap" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${helvetica.variable}  antialiased grow min-h-screen flex`}
      >
        <SnackbarProvider>
          <Suspense fallback={<div>Blivap</div>}>{children}</Suspense>
          <Snackbar />
        </SnackbarProvider>
      </body>
    </html>
  );
}
