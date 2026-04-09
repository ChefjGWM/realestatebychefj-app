import { ImageResponse } from "next/og";

// 512×512 maskable PWA icon for Android's adaptive icon system.
// Served as a custom route at /icon-maskable — the root manifest references
// it as a "maskable" purpose icon. The design keeps the logo inside the
// center ~60% safe zone so Android's circular/squircle/rounded-square
// clippers never remove the important part.

export const runtime = "edge";

export async function GET() {
  // Fetch Cormorant Garamond for the brand "J".
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
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* The "J" is sized so it fits inside the center 60% safe zone,
            which means it stays fully visible no matter how Android
            clips the icon (circle, squircle, square, etc.) */}
        <div
          style={{
            fontSize: 320,
            fontWeight: 700,
            color: "#c9a052",
            lineHeight: 1,
            marginTop: -40,
          }}
        >
          J
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
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
