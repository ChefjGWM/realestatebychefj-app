import { ImageResponse } from "next/og";

// 180x180 apple touch icon for the /admin route only.
// Inverted color scheme (gold background, navy "J") so the installed
// home-screen tile is visually distinct from the main Chef J Tools icon.

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AdminAppleIcon() {
  // Fetch Cormorant Garamond at build time for the brand "J".
  let fontData: ArrayBuffer | null = null;
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((.+?)\)\s*format/);
    if (match) {
      fontData = await fetch(match[1]).then((r) => r.arrayBuffer());
    }
  } catch {
    fontData = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          // Inverted: gold background
          background: "#c9a052",
          backgroundImage: "linear-gradient(135deg, #c9a052 0%, #e8c97a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* Navy border ring, inset so iOS home-screen rounding keeps it visible */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "3px solid #0b1f3a",
            borderRadius: 32,
            display: "flex",
          }}
        />
        {/* Navy serif "J" in the center */}
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            color: "#0b1f3a",
            lineHeight: 1,
            marginTop: -20,
          }}
        >
          J
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Cormorant Garamond",
              data: fontData,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    },
  );
}
