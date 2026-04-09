import type { Metadata } from "next";
import Link from "next/link";
import { T, sans, serif } from "@/components/shared/theme";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Home Buyer Tools — a free toolkit of mortgage, DTI, closing cost, down payment, and seller net sheet calculators by Chef J.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Real Estate by Chef J",
    description:
      "About Home Buyer Tools — a free toolkit of calculators for home buyers and sellers by Chef J.",
    url: "https://tools.realestatebychefj.com/about",
    type: "website",
    // Defining a child openGraph here would otherwise drop the auto-injected
    // /opengraph-image. Reference it explicitly so /about shares with the
    // same branded preview as the home page.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Home Buyer Tools | Real Estate by Chef J",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Real Estate by Chef J",
    description:
      "About Home Buyer Tools — a free toolkit of calculators for home buyers and sellers by Chef J.",
    images: ["/opengraph-image"],
  },
};

const tools = [
  ["Monthly Budget Planner", "See how a home payment fits inside your full monthly picture."],
  ["DTI Calculator", "Front-end and back-end debt-to-income ratios with lender thresholds."],
  ["Down Payment Planner", "Project savings against 3% / 5% / 10% / 20% down targets."],
  ["Mortgage & True Cost", "PITI plus PMI, MIP, HOA, CDD, flood, and special assessments."],
  ["Closing Cost Estimator", "Itemized closing costs by state, including FL doc-stamp and intangible tax."],
  ["Realtor Commission", "How the 2024 NAR settlement changes who pays the buyer's-agent fee."],
  ["DIY Renovation Calculator", "Contractor vs. DIY estimates for kitchens, baths, roofing, fencing, and more."],
  ["Seller Net Sheet", "Side-by-side net proceeds at three sale prices with full deductions."],
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: T.cream, fontFamily: sans, color: T.text }}>
      {/* Header */}
      <header style={{ background: T.navy, padding: "28px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(201,160,82,0.07)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>Real Estate by Chef J</div>
          <h1 style={{ fontSize: 32, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.1, margin: 0 }}>
            About <span style={{ color: T.goldLight }}>Home Buyer Tools</span>
          </h1>
          <p style={{ fontSize: 13, color: "#7a8eaa", marginTop: 8, marginBottom: 0 }}>
            A free toolkit for home buyers and sellers — built by Chef J.
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="resp-form" style={{ padding: "28px 22px 56px", maxWidth: 680, margin: "0 auto" }}>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: T.text }}>
          Home Buyer Tools is a free, no-signup-required collection of calculators
          designed to help home buyers and sellers understand the real numbers
          behind a real estate transaction. Every estimate is approximate — use
          them to plan and ask better questions, then confirm exact figures with
          your lender, title company, and agent before making decisions.
        </p>

        <h2 style={{ fontFamily: serif, fontSize: 22, color: T.navy, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>
          What's inside
        </h2>
        <div style={{ background: T.creamDark, borderRadius: 12, padding: "16px 20px", border: `1px solid ${T.border}` }}>
          {tools.map(([name, desc]) => (
            <div key={name} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.navy }}>{name}</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: serif, fontSize: 22, color: T.navy, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>
          About Chef J
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: T.text }}>
          Chef J is a real estate agent serving buyers and sellers with a focus on
          transparent numbers and no-pressure guidance. Visit{" "}
          <a
            href="https://realestatebychefj.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: T.gold, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            realestatebychefj.com
          </a>{" "}
          to search active listings, learn more, or schedule a consult.
        </p>

        <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 22px",
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`,
              color: T.navy,
              borderRadius: 10,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ← Open the Tools
          </Link>
          <a
            href="https://realestatebychefj.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 22px",
              background: T.navy,
              color: T.goldLight,
              borderRadius: 10,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              border: `1px solid ${T.gold}`,
            }}
          >
            Visit realestatebychefj.com →
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: T.navy, padding: "14px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: sans, lineHeight: 1.6 }}>
          realestatebychefj.com · Estimates for informational purposes only. Consult your lender & agent for exact figures.
        </div>
      </div>
    </main>
  );
}
