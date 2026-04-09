import { ImageResponse } from "next/og";

// Build-time generated branded social share image (1200×630).
// Next.js auto-injects this into <meta property="og:image"> and
// <meta name="twitter:image"> for every route under this segment.
//
// Edit this file to change how shares look on Facebook, LinkedIn,
// iMessage, WhatsApp, Slack, Twitter/X, etc.

export const runtime = "edge";
export const alt = "Home Buyer Tools | Real Estate by Chef J";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0b1f3a";
const NAVY_LIGHT = "#1a3358";
const GOLD = "#c9a052";
const GOLD_LIGHT = "#e8c97a";
const WHITE = "#ffffff";
const MUTED = "#aab8d0";

export default async function Image() {
  // Fetch Cormorant Garamond from Google Fonts at build time so the headline
  // matches the in-app brand font. If the font fetch fails (offline build,
  // network blip), we silently fall back to Satori's default serif.
  let cormorant: ArrayBuffer | null = null;
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((.+?)\)\s*format/);
    if (match) {
      cormorant = await fetch(match[1]).then((r) => r.arrayBuffer());
    }
  } catch {
    cormorant = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: NAVY,
          backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
          display: "flex",
          flexDirection: "column",
          padding: "80px 90px",
          position: "relative",
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* Gold corner accent — top right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: "rgba(201, 160, 82, 0.10)",
            display: "flex",
          }}
        />
        {/* Gold corner accent — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 280,
            height: 280,
            borderRadius: 9999,
            background: "rgba(201, 160, 82, 0.06)",
            display: "flex",
          }}
        />

        {/* Brand kicker */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: GOLD,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Real Estate by Chef J
        </div>

        {/* Big headline — two lines */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 0.95,
          }}
        >
          <div style={{ fontSize: 124, fontWeight: 700, color: WHITE }}>
            Home Buyer
          </div>
          <div style={{ fontSize: 124, fontWeight: 700, color: GOLD_LIGHT }}>
            Tools
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: MUTED,
            marginTop: 40,
            maxWidth: 920,
            lineHeight: 1.35,
            fontFamily: "sans-serif",
          }}
        >
          Free mortgage, DTI, closing-cost & down-payment calculators — plus a seller net sheet.
        </div>

        {/* Bottom row — gold bar + URL */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 90,
            right: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: GOLD,
              letterSpacing: 2,
              fontFamily: "sans-serif",
              fontWeight: 600,
            }}
          >
            tools.realestatebychefj.com
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: 22,
              color: MUTED,
              fontFamily: "sans-serif",
            }}
          >
            <span style={{ display: "flex" }}>🏠</span>
            <span style={{ display: "flex" }}>📊</span>
            <span style={{ display: "flex" }}>💰</span>
            <span style={{ display: "flex" }}>📋</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: cormorant
        ? [
            {
              name: "Cormorant Garamond",
              data: cormorant,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    },
  );
}
