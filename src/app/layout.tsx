import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://tools.realestatebychefj.com";
const SITE_NAME = "Real Estate by Chef J";
const TITLE = "Home Buyer Tools | Real Estate by Chef J";
const DESCRIPTION =
  "Free mortgage calculator, DTI calculator, closing costs estimator, down payment planner, and seller net sheet. Powered by Real Estate by Chef J.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Real Estate by Chef J",
  },
  description: DESCRIPTION,
  keywords: [
    "mortgage calculator",
    "DTI calculator",
    "closing costs",
    "down payment",
    "seller net sheet",
    "real estate",
    "Chef J",
    "home buyer tools",
  ],
  authors: [{ name: SITE_NAME, url: "https://realestatebychefj.com" }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@realestatebychefj",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1f3a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
