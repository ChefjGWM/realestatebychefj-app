// Pure constants module — safe to import from React Server Components.
// The `useFont` hook was moved to ./use-font.js (client-only) so this file
// stays free of `react` hook imports.

export const WEBSITE_URL = "https://realestatebychefj.com";

export const T = {
  navy: "#0b1f3a", navyLight: "#132844", navyMid: "#1a3358",
  gold: "#c9a052", goldLight: "#e8c97a", goldFaint: "rgba(201,160,82,0.12)",
  cream: "#f5f0e8", creamDark: "#ede5d8", creamMid: "#e5ddd0",
  text: "#1a1a2e", muted: "#6b7a99", mutedLight: "#9aa3b8",
  green: "#2d7a4f", red: "#b5541a", white: "#ffffff", border: "#ddd5c4",
};


export const fc = (v) => v == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
export const fc2 = (v) => v == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
export const fp = (v) => `${parseFloat(v || 0).toFixed(1)}%`;
export const serif = "'Cormorant Garamond', serif";
export const sans = "'DM Sans', sans-serif";
export const n = (v) => parseFloat(v) || 0;
