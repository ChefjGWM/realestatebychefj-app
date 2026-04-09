import { ImageResponse } from "next/og";

// 180×180 PNG apple touch icon used by iOS when a user taps
// "Add to Home Screen". Next.js auto-injects
// <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180"> in <head>.

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  // Fetch Cormorant Garamond so the "J" matches the brand font.
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
          background: "#0b1f3a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* Gold border ring, inset so iOS home-screen rounding doesn't clip it */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "3px solid #c9a052",
            borderRadius: 32,
            display: "flex",
          }}
        />
        {/* Serif "J" monogram in brand gold */}
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            color: "#c9a052",
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
