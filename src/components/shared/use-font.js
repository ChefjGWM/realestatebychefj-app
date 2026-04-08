"use client";

import { useEffect } from "react";

// Injects Cormorant Garamond + DM Sans from Google Fonts on the client.
export function useFont() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);
}
