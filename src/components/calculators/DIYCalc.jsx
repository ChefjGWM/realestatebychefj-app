import { useState } from "react";
import { T, sans, serif, fc, n } from "../shared/theme";
import { Field, Result } from "../shared/ui";

export default function DIYCalc() {
  const [room, setRoom]       = useState("Kitchen");
  const [sqft, setSqft]       = useState(200);
  const [linFt, setLinFt]     = useState(150);
  const [roofSqft, setRoofSqft] = useState(1800);
  const [quality, setQuality] = useState("mid");

  const projects = {
    Kitchen:      { low: 15000, mid: 30000,  high: 65000,  diy: 0.35, measure: null },
    Bathroom:     { low: 6000,  mid: 14000,  high: 30000,  diy: 0.40, measure: null },
    "Living Room":{ low: 3000,  mid: 8000,   high: 20000,  diy: 0.45, measure: null },
    Bedroom:      { low: 2500,  mid: 6000,   high: 15000,  diy: 0.50, measure: null },
    Flooring:     { low: n(sqft)*3,   mid: n(sqft)*7,   high: n(sqft)*14,  diy: 0.60, measure: "sqft" },
    Painting:     { low: n(sqft)*1.5, mid: n(sqft)*3,   high: n(sqft)*5,   diy: 0.75, measure: "sqft" },
    Roofing:      { low: n(roofSqft)*3.5, mid: n(roofSqft)*6, high: n(roofSqft)*12, diy: 0.25, measure: "roof" },
    Fencing:      { low: n(linFt)*18,  mid: n(linFt)*38,  high: n(linFt)*75,  diy: 0.55, measure: "linft" },
    Deck:         { low: 5000,  mid: 12000,  high: 28000,  diy: 0.50, measure: null },
    Landscaping:  { low: 2000,  mid: 7000,   high: 20000,  diy: 0.55, measure: null },
  };

  const roofingNotes = {
    low:  "Asphalt shingle repair / small roof",
    mid:  "Full asphalt shingle replacement (~1,800 sqft)",
    high: "Metal, tile, or premium materials",
  };
  const fencingNotes = {
    low:  "Chain link or basic wood fence",
    mid:  "Wood privacy or vinyl fence",
    high: "Aluminum, wrought iron, or premium vinyl",
  };
  const roofingDIYNote = "⚠️ Roofing is high-risk — most homeowners hire out. DIY savings reflect materials only; always consult a licensed roofer.";

  const p    = projects[room];
  const cost = p[quality];
  const savings = cost * p.diy;

  const measureField = {
    sqft:  <Field label="Square Footage" value={sqft}     onChange={setSqft}     suffix="sq ft" min={1} step={50} />,
    roof:  <Field label="Roof Area (sq ft)" value={roofSqft} onChange={setRoofSqft} suffix="sq ft" min={100} step={100} tooltip="Measure the footprint of your roof, not just the floor area. Add ~20% for pitch." />,
    linft: <Field label="Linear Feet of Fence" value={linFt} onChange={setLinFt}  suffix="lin ft" min={1} step={10} tooltip="Total length of fencing needed. An avg yard is 120–200 linear feet." />,
  };

  return (
    <div>
      {/* Disclaimer */}
      <div style={{ background: T.creamDark, borderRadius: 8, padding: "9px 13px", border: `1px solid ${T.border}`, marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>📐</span>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: sans, lineHeight: 1.5 }}>All costs are <strong style={{ color: T.text }}>approximate estimates</strong> based on national averages. Actual prices vary by location, materials, and contractor. Get multiple quotes before committing.</span>
      </div>

      {/* Project Selector — 5 per row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 14 }}>
        {Object.keys(projects).map(r => (
          <button key={r} onClick={() => setRoom(r)}
            style={{ padding: "8px 4px", borderRadius: 8, border: `1.5px solid ${room === r ? T.gold : T.border}`, background: room === r ? T.navy : T.white, color: room === r ? T.goldLight : T.text, fontSize: 10.5, fontFamily: sans, cursor: "pointer", lineHeight: 1.3, textAlign: "center" }}>
            {r}
          </button>
        ))}
      </div>

      {/* Dynamic measurement input */}
      {p.measure && measureField[p.measure]}

      {/* Roofing safety note */}
      {room === "Roofing" && (
        <div style={{ background: "#fff3e0", border: "1px solid #e8a020", borderRadius: 8, padding: "9px 13px", marginBottom: 12, fontSize: 11, color: "#7a4500", fontFamily: sans, lineHeight: 1.5 }}>
          {roofingDIYNote}
        </div>
      )}

      {/* Quality selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[["low", "Budget"], ["mid", "Mid-Range"], ["high", "Premium"]].map(([v, l]) => (
          <button key={v} onClick={() => setQuality(v)}
            style={{ padding: "10px", borderRadius: 8, border: `1.5px solid ${quality === v ? T.gold : T.border}`, background: quality === v ? T.navy : T.white, color: quality === v ? T.goldLight : T.text, fontSize: 12, fontFamily: sans, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Context note for roofing / fencing */}
      {room === "Roofing" && (
        <div style={{ fontSize: 11, color: T.muted, fontFamily: sans, marginBottom: 10, padding: "0 2px" }}>
          💡 {roofingNotes[quality]}
        </div>
      )}
      {room === "Fencing" && (
        <div style={{ fontSize: 11, color: T.muted, fontFamily: sans, marginBottom: 10, padding: "0 2px" }}>
          💡 {fencingNotes[quality]}
        </div>
      )}

      {/* Results */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Result label="Contractor Cost (est.)" value={fc(cost)} sub="Labor + materials" small />
        <Result label="DIY Cost (est.)" value={fc(cost - savings)} sub="Materials only" small />
      </div>
      <Result label="Potential DIY Savings" value={fc(savings)}
        sub={`Save ~${Math.round(p.diy * 100)}% doing it yourself · All figures are estimates`} accent />
    </div>
  );
}
