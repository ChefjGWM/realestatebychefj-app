import type { MetadataRoute } from "next";

// Web App Manifest — makes the site installable as a PWA on iOS and
// Android. Next.js serves this at /manifest.webmanifest and auto-injects
// <link rel="manifest" href="/manifest.webmanifest"> into the document head.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Real Estate by Chef J — Home Buyer Tools",
    short_name: "Chef J Tools",
    description:
      "Free mortgage, DTI, closing cost, down payment & seller net sheet calculators.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0b1f3a",
    theme_color: "#0b1f3a",
    categories: ["finance", "business", "productivity"],
    lang: "en-US",
    icons: [
      // SVG scales to any size — Android Chrome handles this well.
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      // Raster PNG for iOS home screen + older Android browsers.
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      // 512×512 maskable PNG — Chrome's install prompt + Android adaptive icons.
      {
        src: "/icon-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
