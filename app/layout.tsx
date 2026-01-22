import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SnackbarProvider } from "./components/snackbar/snackbar.context";
import { Snackbar } from "./components/snackbar/snackbar.component";
import { config } from "./utils/config";
import StoreProvider from "./store/provider";
import { ProtectedRoute } from "./components/auth/protected-route";
import { StructuredData } from "./components/seo/structured-data";

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
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
    "Nigeria blood donation",
    "blood donor Nigeria",
    "sperm donor Nigeria",
    "medical platform",
  ],
  authors: [{ name: "Blivap", url: siteUrl }],
  creator: "Blivap",
  publisher: "Blivap",
  applicationName: "Blivap",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_NG"],
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
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon0.svg",
        color: "#960018",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Blivap",
    "mobile-web-app-capable": "yes",
    "theme-color": "#960018",
    "msapplication-TileColor": "#960018",
    "msapplication-config": "/site.webmanifest",
    // WhatsApp and other social media
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    "og:image:secure_url": ogImageUrl,
    // LinkedIn
    "linkedin:owner": "Blivap",
    // Additional SEO
    "geo.region": "NG",
    "geo.placename": "Nigeria",
    "ICBM": "9.0820, 8.6753",
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
        <StructuredData />
      </head>
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
