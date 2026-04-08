import { useState } from "react";
import { T, sans, serif, fc, fp, n } from "../shared/theme";
import { Field, Result, SectionDivider } from "../shared/ui";

export default function CommissionCalc() {
  const [price, setPrice] = useState(450000);
  const [sellerPays, setSellerPays] = useState(3); // % seller covers (0–3)
  const [scenario, setScenario] = useState("seller"); // seller | split | buyer

  const commission = n(price) * 0.03;
  const sellerAmt = scenario === "seller" ? commission : scenario === "buyer" ? 0 : (n(price) * n(sellerPays)) / 100;
  const buyerAmt  = commission - sellerAmt;
  const buyerPct  = commission > 0 ? (buyerAmt / commission) * 100 : 0;

  // If buyer rolls their portion into the offer price
  const adjustedOffer = n(price) + buyerAmt;

  const scenarios = [
    { id: "seller", icon: "🏡", title: "Seller Pays Full Commission", sub: "Seller covers the full 3% from sale proceeds — the traditional model and still most common in negotiated offers." },
    { id: "split",  icon: "🤝", title: "Split Between Buyer & Seller", sub: "Buyer and seller negotiate how much each party covers. Buyer portion is often rolled into the offer price." },
    { id: "buyer",  icon: "👤", title: "Buyer Pays Full Commission",  sub: "Buyer is fully responsible for the 3% fee. This can be paid at closing or built into a higher offer price." },
  ];

  return (
    <div>
      {/* NAR Banner */}
      <div style={{ background: T.navy, borderRadius: 12, padding: "16px 18px", border: `1px solid ${T.gold}`, marginBottom: 18 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.gold, fontFamily: sans, marginBottom: 6 }}>Important — 2024 NAR Settlement</div>
        <div style={{ fontSize: 13, color: T.white, fontFamily: sans, lineHeight: 1.6, marginBottom: 8 }}>
          As of <strong style={{ color: T.goldLight }}>August 2024</strong>, new rules from the National Association of Realtors® changed how buyer's agent commissions work:
        </div>
        {[
          ["📄", "Buyers must sign a written Buyer Representation Agreement before touring homes — it specifies the agent's compensation upfront."],
          ["🚫", "Sellers are no longer required to offer buyer's agent compensation through the MLS listing."],
          ["💬", "Compensation is now fully negotiable — buyers can ask sellers to cover all, part, or none of the buyer's agent fee as part of their offer."],
          ["✅", "Many sellers still offer concessions to cover it, especially in a buyer's market or to attract stronger offers."],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 12, color: "#c8d4e8", fontFamily: sans, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Chef J Commission Statement */}
      <div style={{ background: `linear-gradient(135deg, ${T.gold}22, ${T.goldLight}11)`, border: `1.5px solid ${T.gold}`, borderRadius: 12, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>👨‍🍳</div>
        <div>
          <div style={{ fontSize: 13, fontFamily: sans, fontWeight: 600, color: T.navy }}>Chef J's Buyer's Agent Commission</div>
          <div style={{ fontSize: 24, fontFamily: serif, fontWeight: 700, color: T.navy, lineHeight: 1.1 }}>3% of Purchase Price</div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: sans, marginTop: 2 }}>Regardless of who pays — seller, buyer, or split — the total fee is always 3%.</div>
        </div>
      </div>

      <Field label="Home Purchase Price" value={price} onChange={setPrice} prefix="$" step={5000} />

      <SectionDivider label="Who Pays the Commission?" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {scenarios.map(s => (
          <button key={s.id} onClick={() => setScenario(s.id)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${scenario === s.id ? T.gold : T.border}`, background: scenario === s.id ? T.navy : T.white, cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontFamily: sans, fontWeight: 600, color: scenario === s.id ? T.goldLight : T.text }}>{s.title}</span>
              {scenario === s.id && <span style={{ marginLeft: "auto", fontSize: 10, background: T.gold, color: T.navy, borderRadius: 20, padding: "2px 8px", fontFamily: sans, fontWeight: 700, flexShrink: 0 }}>Selected</span>}
            </div>
            <div style={{ fontSize: 11, color: scenario === s.id ? "#aab8d0" : T.muted, fontFamily: sans, lineHeight: 1.5, paddingLeft: 24 }}>{s.sub}</div>
          </button>
        ))}
      </div>

      {scenario === "split" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 6 }}>
            <span>Seller Pays</span>
            <span style={{ color: T.gold }}>{fp(sellerPays)} seller · {fp(3 - n(sellerPays))} buyer</span>
          </label>
          <input type="range" min={0} max={3} step={0.25} value={sellerPays} onChange={e => setSellerPays(e.target.value)}
            style={{ width: "100%", accentColor: T.gold, cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted, fontFamily: sans, marginTop: 3 }}>
            <span>Buyer pays all</span><span>50 / 50</span><span>Seller pays all</span>
          </div>
        </div>
      )}

      <SectionDivider label="Commission Breakdown" />
      <div style={{ background: T.creamDark, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}`, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 12, fontFamily: sans, color: T.text }}>Total Commission (3%)</span>
          <span style={{ fontSize: 15, fontFamily: serif, fontWeight: 700, color: T.navy }}>{fc(commission)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 12, fontFamily: sans, color: T.text }}>Seller's Portion</span>
          <span style={{ fontSize: 14, fontFamily: serif, fontWeight: 600, color: sellerAmt > 0 ? T.green : T.muted }}>{fc(sellerAmt)} {sellerAmt > 0 ? `(${fp((sellerAmt / commission) * 100)})` : "(none)"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0" }}>
          <span style={{ fontSize: 12, fontFamily: sans, color: T.text }}>Buyer's Portion</span>
          <span style={{ fontSize: 14, fontFamily: serif, fontWeight: 600, color: buyerAmt > 0 ? T.red : T.green }}>{fc(buyerAmt)} {buyerAmt > 0 ? `(${fp(buyerPct)})` : "(none)"}</span>
        </div>
      </div>

      {buyerAmt > 0 && (
        <div style={{ background: "#fff8ec", border: `1px solid ${T.gold}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontFamily: sans, fontWeight: 600, color: "#7a5500", marginBottom: 6 }}>💡 How Buyers Often Handle Their Portion</div>
          <div style={{ fontSize: 11, color: "#7a5500", fontFamily: sans, lineHeight: 1.6 }}>
            Rather than paying {fc(buyerAmt)} out of pocket at closing, many buyers <strong>increase their offer price</strong> and ask the seller to credit it back as a concession — effectively rolling it into the loan.
          </div>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: T.white, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, fontFamily: sans }}>List / Offer Price</div>
              <div style={{ fontSize: 17, fontFamily: serif, fontWeight: 700, color: T.navy }}>{fc(price)}</div>
            </div>
            <div style={{ background: T.navy, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: T.gold, fontFamily: sans }}>Adjusted Offer Price</div>
              <div style={{ fontSize: 17, fontFamily: serif, fontWeight: 700, color: T.goldLight }}>{fc(adjustedOffer)}</div>
              <div style={{ fontSize: 9, color: "#7a8eaa", fontFamily: sans }}>+{fc(buyerAmt)} to cover fee</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#9a7020", fontFamily: sans, marginTop: 8 }}>⚠️ This strategy requires the seller to accept a higher price and depends on the home appraising at the adjusted value.</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Result label="Buyer Pays at Closing" value={fc(buyerAmt)} sub={buyerAmt === 0 ? "Nothing due from buyer" : "Due at closing"} color={buyerAmt === 0 ? T.green : T.red} small />
        <Result label="Seller Covers" value={fc(sellerAmt)} sub={sellerAmt === commission ? "Full commission" : sellerAmt === 0 ? "Nothing" : "Partial"} color={T.green} small />
      </div>
      <Result label="Chef J's Total Commission" value={fc(commission)} sub={`3% of ${fc(price)} — always the same regardless of who pays`} accent />

      <div style={{ background: T.creamDark, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}`, marginTop: 10 }}>
        <div style={{ fontSize: 11, fontFamily: sans, fontWeight: 600, color: T.navy, marginBottom: 8 }}>📋 What You Should Know</div>
        {[
          "You'll sign a Buyer Representation Agreement with Chef J before touring homes — this outlines the 3% fee.",
          "When making an offer, your agent will advise whether to ask the seller to cover the commission as a concession.",
          "In competitive markets, asking for concessions may weaken your offer — we'll strategize together.",
          "The commission is only paid if a transaction closes — no sale, no fee.",
        ].map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: T.gold, flexShrink: 0, fontFamily: serif, fontWeight: 700 }}>{i + 1}.</span>
            <span style={{ fontSize: 11, color: T.text, fontFamily: sans, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
