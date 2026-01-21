import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SnackbarProvider } from "./components/snackbar/snackbar.context";
import { Snackbar } from "./components/snackbar/snackbar.component";
import { StructuredData } from "./components/seo/structured-data";
import { config } from "./utils/config";
import StoreProvider from "./store/provider";
import { ProtectedRoute } from "./components/auth/protected-route";

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
const { url, env } = config;

const siteUrl = env === "development" ? "http://localhost:3000" : url;
const ogImageUrl = `${siteUrl}/api/og`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blivap — Give Blood. Save Lives.",
    template: "%s | Blivap",
  },
  description:
    "Blivap connects blood and sperm donors with people in need across Nigeria. Join our platform to donate, save lives, and earn money while making a difference in your community.",
  keywords: [
    "blood donation",
    "sperm donation",
    "Nigeria",
    "donate blood",
    "save lives",
    "blood bank",
    "healthcare",
    "medical donation",
    "life saving",
    "donor platform",
    "blood donor",
    "medical services",
  ],
  authors: [{ name: "Blivap" }],
  creator: "Blivap",
  publisher: "Blivap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Blivap",
    title: "Blivap — Give Blood. Save Lives.",
    description:
      "Connect with blood and sperm donors across Nigeria. Join Blivap to donate, save lives, and make a meaningful impact in your community.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Blivap — Blood and Sperm Donation Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blivap — Give Blood. Save Lives.",
    description:
      "Connect with blood and sperm donors across Nigeria. Join Blivap to donate, save lives, and make a meaningful impact.",
    images: [ogImageUrl],
    creator: "@blivap",
    site: "@blivap",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Healthcare",
  classification: "Medical Services",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${helvetica.variable}  antialiased grow min-h-screen flex`}
      >
        <StoreProvider>
          <SnackbarProvider>
            <ProtectedRoute>{children}</ProtectedRoute>
            <Snackbar />
          </SnackbarProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
