import type { Metadata } from "next";

// Server-component layout for the /admin segment so we can attach route-
// specific metadata (the page.tsx is "use client" and therefore can't
// export a metadata object itself).
//
// This gives /admin its own title, apple-touch-icon, and PWA "add to home
// screen" name, distinct from the main client toolkit.

export const metadata: Metadata = {
  title: "Agent CRM",
  description:
    "Agent CRM dashboard for Real Estate by Chef J — view client DTI, budget, and registration history.",
  robots: {
    // Don't index the admin page — it's behind auth and shouldn't be crawled.
    index: false,
    follow: false,
  },
  alternates: { canonical: "/admin" },
  openGraph: {
    title: "Agent CRM | Real Estate by Chef J",
    description: "Private agent dashboard.",
    url: "https://tools.realestatebychefj.com/admin",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Home Buyer Tools | Real Estate by Chef J",
      },
    ],
  },
  // iOS "Add to Home Screen" — override the title so the installed
  // tile reads "Chef J CRM" instead of "Chef J Tools".
  appleWebApp: {
    capable: true,
    title: "Chef J CRM",
    statusBarStyle: "black-translucent",
  },
  // Route-scoped apple-touch-icon auto-detected from src/app/admin/apple-icon.tsx.
  // Reference it explicitly so Next injects the link tag (setting metadata.icons
  // prevents the file-convention auto-inject otherwise).
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/admin/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
