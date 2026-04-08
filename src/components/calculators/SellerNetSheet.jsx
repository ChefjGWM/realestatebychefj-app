import { useState } from "react";
import { T, sans, serif, fc, n } from "../shared/theme";
import { Field, Toggle, SectionDivider } from "../shared/ui";

export default function SellerNetSheet({ onClose }) {
  // Prices
  const [basePrice, setBasePrice]     = useState(450000);
  const [priceA, setPriceA]           = useState(435000);
  const [priceB, setPriceB]           = useState(450000);
  const [priceC, setPriceC]           = useState(465000);
  const [labelA, setLabelA]           = useState("Below Ask");
  const [labelB, setLabelB]           = useState("List Price");
  const [labelC, setLabelC]           = useState("Above Ask");

  // Loans
  const [mortgage1, setMortgage1]     = useState(280000);
  const [mortgage2, setMortgage2]     = useState(0);
  const [hasMortgage2, setHasMortgage2] = useState(false);
  const [perDiemDays, setPerDiemDays] = useState(15);
  const [mortgageRate, setMortgageRate] = useState(4.5);

  // Commission
  const [listingComm, setListingComm] = useState(3.0);
  const [buyerComm, setBuyerComm]     = useState(3.0);

  // Seller Closing Costs
  const [docStampRate, setDocStampRate] = useState(0.70); // FL default
  const [titleIns, setTitleIns]       = useState(true);
  const [settleFee, setSettleFee]     = useState(650);
  const [hoaEstoppel, setHoaEstoppel] = useState(0);
  const [homeWarranty, setHomeWarranty] = useState(0);
  const [attyFee, setAttyFee]         = useState(0);
  const [propTaxProrate, setPropTaxProrate] = useState(true);
  const [propTaxRate2, setPropTaxRate2] = useState(1.1);

  // Seller Costs
  const [repairs, setRepairs]         = useState(0);
  const [staging, setStaging]         = useState(0);
  const [concessions, setConcessions] = useState(0);
  const [otherCosts, setOtherCosts]   = useState(0);

  const calcNet = (price) => {
    const p = n(price);
    if (p === 0) return null;

    const totalCommPct = (n(listingComm) + n(buyerComm)) / 100;
    const commission   = p * totalCommPct;

    const docStamp     = (p * n(docStampRate)) / 100;
    const titleInsCost = titleIns ? p * 0.00575 : 0;
    const taxProrate   = propTaxProrate ? (p * n(propTaxRate2) / 100 / 365) * 182 : 0; // ~6mo avg
    const closingCosts = docStamp + titleInsCost + n(settleFee) + n(hoaEstoppel) + n(homeWarranty) + n(attyFee) + taxProrate;

    const perDiem      = (n(mortgage1) * n(mortgageRate) / 100 / 365) * n(perDiemDays);
    const loan1Payoff  = n(mortgage1) + perDiem;
    const loan2Payoff  = hasMortgage2 ? n(mortgage2) : 0;
    const totalLoans   = loan1Payoff + loan2Payoff;

    const sellerCosts  = n(repairs) + n(staging) + n(concessions) + n(otherCosts);
    const totalDeductions = commission + closingCosts + totalLoans + sellerCosts;
    const net = p - totalDeductions;

    return { p, commission, docStamp, titleInsCost, taxProrate, closingCosts, loan1Payoff, loan2Payoff, totalLoans, sellerCosts, totalDeductions, net, perDiem };
  };

  const scenarios = [
    { label: labelA, price: priceA, setPrice: setPriceA, setLabel: setLabelA, accent: false },
    { label: labelB, price: priceB, setPrice: setPriceB, setLabel: setLabelB, accent: true  },
    { label: labelC, price: priceC, setPrice: setPriceC, setLabel: setLabelC, accent: false },
  ];

  const results = scenarios.map(s => ({ ...s, calc: calcNet(s.price) }));
  const maxNet   = Math.max(...results.map(r => r.calc?.net || 0));

  const DeductRow = ({ label, vals, isSub, isTotal, tooltip }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 4, padding: isSub ? "3px 0 3px 10px" : isTotal ? "8px 0" : "5px 0", borderBottom: isTotal ? `2px solid ${T.navy}` : `1px solid ${T.border}`, borderTop: isTotal ? `2px solid ${T.navy}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: isSub ? 10 : 11, color: isSub ? T.muted : T.text, fontFamily: sans, fontWeight: isTotal ? 700 : 400 }}>{isSub ? "└ " : ""}{label}</span>
        {tooltip && <span title={tooltip} style={{ fontSize: 9, color: T.gold, cursor: "help" }}>ⓘ</span>}
      </div>
      {vals.map((v, i) => (
        <div key={i} style={{ textAlign: "right" }}>
          <span style={{ fontSize: isTotal ? 13 : isSub ? 10 : 11, fontFamily: isTotal ? serif : sans, fontWeight: isTotal ? 700 : 400, color: isTotal ? T.navy : isSub ? T.muted : T.text }}>
            {v == null ? "—" : (v === 0 ? <span style={{ color: T.mutedLight }}>—</span> : fc(v))}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: sans }}>
      {/* Header */}
      <div style={{ background: T.navy, padding: "18px 18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(201,160,82,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: T.gold, marginBottom: 3, fontFamily: sans }}>Real Estate by Chef J</div>
            <div style={{ fontSize: 22, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>
              Seller <span style={{ color: T.goldLight }}>Net Sheet</span>
            </div>
            <div style={{ fontSize: 11, color: "#7a8eaa", marginTop: 3, fontFamily: sans }}>See your estimated proceeds at 3 different sale prices</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "8px 14px", color: T.white, fontSize: 12, fontFamily: sans, cursor: "pointer", flexShrink: 0 }}>
            ← Buyer Tools
          </button>
        </div>
      </div>

      <div className="resp-form" style={{ padding: "20px 16px 48px", maxWidth: 720, margin: "0 auto" }}>

        {/* ── Sale Price Scenarios ─────────────────────────── */}
        <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Sale Price Scenarios</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
          {scenarios.map((s, i) => (
            <div key={i} style={{ background: s.accent ? T.navy : T.white, borderRadius: 10, padding: "12px 12px", border: `1.5px solid ${s.accent ? T.gold : T.border}` }}>
              <input value={s.label} onChange={e => s.setLabel(e.target.value)}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: s.accent ? T.gold : T.muted, fontFamily: sans, marginBottom: 5, cursor: "text" }} />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: s.accent ? T.goldLight : T.gold, fontFamily: serif, fontWeight: 600, fontSize: 16 }}>$</span>
                <input type="number" value={s.price} onChange={e => s.setPrice(e.target.value)} step={1000}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${s.accent ? "rgba(201,160,82,0.4)" : T.border}`, outline: "none", fontSize: 18, fontFamily: serif, fontWeight: 700, color: s.accent ? T.white : T.navy, paddingLeft: 14, paddingBottom: 3, boxSizing: "border-box" }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Loan Payoffs ─────────────────────────────────── */}
        <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Current Loan Payoffs</div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: sans, marginBottom: 12 }}>Contact your lender for an exact payoff statement — includes principal balance + accrued interest.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="1st Mortgage Balance" value={mortgage1} onChange={setMortgage1} prefix="$" step={1000} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Field label="Loan Rate" value={mortgageRate} onChange={setMortgageRate} suffix="%" step={0.1} tooltip="Used to calculate per-diem interest at closing" />
            <Field label="Per-Diem Days" value={perDiemDays} onChange={setPerDiemDays} suffix="days" min={1} max={31} tooltip="Days of interest from payoff to closing. Typically 15–30 days." />
          </div>
        </div>
        <Toggle label="Second Mortgage / HELOC" checked={hasMortgage2} onChange={setHasMortgage2} tooltip="Include if you have a home equity loan or line of credit" />
        {hasMortgage2 && <Field label="2nd Mortgage / HELOC Balance" value={mortgage2} onChange={setMortgage2} prefix="$" step={1000} />}

        {/* ── Commission ───────────────────────────────────── */}
        <SectionDivider label="Commission" />
        <div style={{ background: T.goldFaint, border: `1px solid ${T.gold}`, borderRadius: 10, padding: "11px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#7a5500", fontFamily: sans, lineHeight: 1.5 }}>
            🤝 <strong>Chef J's buyer's agent fee is 3%.</strong> Since the 2024 NAR settlement, seller and buyer negotiate how each side is compensated. Both fields below are editable.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Listing Agent Commission" value={listingComm} onChange={setListingComm} suffix="%" step={0.25} tooltip="Your listing agent's fee" />
          <Field label="Buyer's Agent Commission" value={buyerComm} onChange={setBuyerComm} suffix="%" step={0.25} tooltip="Chef J's fee — 3% standard" />
        </div>
        <div style={{ background: T.creamDark, borderRadius: 8, padding: "8px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontFamily: sans, color: T.text }}>Total Commission Rate</span>
          <span style={{ fontSize: 16, fontFamily: serif, fontWeight: 700, color: T.navy }}>{(n(listingComm) + n(buyerComm)).toFixed(2)}%</span>
        </div>

        {/* ── Seller Closing Costs ─────────────────────────── */}
        <SectionDivider label="Seller Closing Costs" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Doc Stamp Tax Rate" value={docStampRate} onChange={setDocStampRate} suffix="% of price" step={0.05} tooltip="FL: 0.70% of sale price on the deed" />
          <Field label="Settlement / Closing Fee" value={settleFee} onChange={setSettleFee} prefix="$" step={50} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="HOA Estoppel Fee" value={hoaEstoppel} onChange={setHoaEstoppel} prefix="$" step={50} tooltip="HOA payoff verification. $0 if no HOA." />
          <Field label="Home Warranty (optional)" value={homeWarranty} onChange={setHomeWarranty} prefix="$" step={50} tooltip="Seller-paid warranty for buyer. Typically $400–$600." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Attorney Fees (optional)" value={attyFee} onChange={setAttyFee} prefix="$" step={50} />
          <Field label="Property Tax Rate" value={propTaxRate2} onChange={setPropTaxRate2} suffix="% /yr" step={0.05} tooltip="Used to prorate unpaid taxes to closing date" />
        </div>
        <Toggle label="Title Insurance (Owner's Policy)" checked={titleIns} onChange={setTitleIns} tooltip="Seller typically pays for owner's title policy in FL. ~0.575% of sale price." />
        <Toggle label="Property Tax Proration (estimated)" checked={propTaxProrate} onChange={setPropTaxProrate} tooltip="Seller owes taxes through the closing date. Based on ~6 months average." />

        {/* ── Other Seller Costs ───────────────────────────── */}
        <SectionDivider label="Other Seller Costs" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Pre-Listing Repairs" value={repairs} onChange={setRepairs} prefix="$" step={500} tooltip="Repairs completed before listing" />
          <Field label="Staging / Photography" value={staging} onChange={setStaging} prefix="$" step={100} />
          <Field label="Buyer Concessions" value={concessions} onChange={setConcessions} prefix="$" step={500} tooltip="Credits offered to the buyer (closing costs, repairs, etc.)" />
          <Field label="Other Costs" value={otherCosts} onChange={setOtherCosts} prefix="$" step={100} />
        </div>

        {/* ── 3-Column Net Sheet ───────────────────────────── */}
        <SectionDivider label="Estimated Net Proceeds Comparison" />
        <div className="resp-table-scroll" style={{ marginBottom: 12 }}>
        <div style={{ background: T.white, borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: "hidden" }}>

          {/* Column Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 4, background: T.navy, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: T.gold, fontFamily: sans, letterSpacing: 1.5, textTransform: "uppercase" }}>Line Item</div>
            {results.map((r, i) => (
              <div key={i} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: r.accent ? T.gold : "#7a8eaa", fontFamily: sans, letterSpacing: 1, textTransform: "uppercase" }}>{r.label}</div>
                <div style={{ fontSize: 14, fontFamily: serif, fontWeight: 700, color: r.accent ? T.goldLight : T.white }}>{fc(r.price)}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 14px" }}>
            {/* Commission */}
            <DeductRow label="Commission" vals={results.map(r => r.calc?.commission)} />
            <DeductRow label={`Listing (${listingComm}%)`} vals={results.map(r => r.calc ? n(r.price) * n(listingComm) / 100 : null)} isSub />
            <DeductRow label={`Buyer's Agent (${buyerComm}%)`} vals={results.map(r => r.calc ? n(r.price) * n(buyerComm) / 100 : null)} isSub />

            {/* Closing Costs */}
            <DeductRow label="Seller Closing Costs" vals={results.map(r => r.calc?.closingCosts)} />
            <DeductRow label={`Doc Stamp (${docStampRate}%)`} vals={results.map(r => r.calc?.docStamp)} isSub />
            {titleIns && <DeductRow label="Title Insurance" vals={results.map(r => r.calc?.titleInsCost)} isSub />}
            <DeductRow label="Settlement Fee" vals={results.map(_ => n(settleFee) || null)} isSub />
            {n(hoaEstoppel) > 0 && <DeductRow label="HOA Estoppel" vals={results.map(_ => n(hoaEstoppel))} isSub />}
            {n(homeWarranty) > 0 && <DeductRow label="Home Warranty" vals={results.map(_ => n(homeWarranty))} isSub />}
            {n(attyFee) > 0 && <DeductRow label="Attorney Fees" vals={results.map(_ => n(attyFee))} isSub />}
            {propTaxProrate && <DeductRow label="Tax Proration (est.)" vals={results.map(r => r.calc?.taxProrate)} isSub tooltip="~6 months of property taxes prorated to seller" />}

            {/* Loan Payoffs */}
            <DeductRow label="Loan Payoffs" vals={results.map(r => r.calc?.totalLoans)} />
            <DeductRow label={`1st Mortgage + Per Diem`} vals={results.map(r => r.calc?.loan1Payoff)} isSub tooltip={`Balance + ${perDiemDays}-day per diem at ${mortgageRate}%`} />
            {hasMortgage2 && <DeductRow label="2nd Mortgage / HELOC" vals={results.map(_ => n(mortgage2) || null)} isSub />}

            {/* Seller Costs */}
            {(n(repairs) + n(staging) + n(concessions) + n(otherCosts)) > 0 && <>
              <DeductRow label="Other Seller Costs" vals={results.map(r => r.calc?.sellerCosts)} />
              {n(repairs) > 0     && <DeductRow label="Repairs"           vals={results.map(_ => n(repairs))}     isSub />}
              {n(staging) > 0     && <DeductRow label="Staging"           vals={results.map(_ => n(staging))}     isSub />}
              {n(concessions) > 0 && <DeductRow label="Buyer Concessions" vals={results.map(_ => n(concessions))} isSub />}
              {n(otherCosts) > 0  && <DeductRow label="Other"             vals={results.map(_ => n(otherCosts))}  isSub />}
            </>}

            {/* Total Deductions */}
            <DeductRow label="Total Deductions" vals={results.map(r => r.calc?.totalDeductions)} isTotal />
          </div>

          {/* NET TO SELLER — highlighted row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 4, padding: "14px 14px", background: T.navy }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: T.gold, fontFamily: sans }}>Net to Seller</div>
              <div style={{ fontSize: 9, color: "#7a8eaa", fontFamily: sans, marginTop: 2 }}>After all deductions</div>
            </div>
            {results.map((r, i) => {
              const net = r.calc?.net ?? 0;
              const isBest = net === maxNet && net > 0;
              return (
                <div key={i} style={{ textAlign: "right" }}>
                  {isBest && <div style={{ fontSize: 8, background: T.gold, color: T.navy, borderRadius: 20, padding: "1px 7px", display: "inline-block", marginBottom: 3, fontFamily: sans, fontWeight: 700, letterSpacing: 0.5 }}>BEST</div>}
                  <div style={{ fontSize: 20, fontFamily: serif, fontWeight: 700, color: net >= 0 ? (isBest ? T.goldLight : T.white) : "#ff8c6b", lineHeight: 1.1 }}>{fc(net)}</div>
                  <div style={{ fontSize: 9, color: net >= 0 ? "#7ab8d0" : "#ff8c6b", fontFamily: sans }}>
                    {n(r.price) > 0 ? `${((net / n(r.price)) * 100).toFixed(1)}% of price` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: T.creamDark, borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: sans, lineHeight: 1.7 }}>
            <strong style={{ color: T.text }}>⚠️ Estimate Only</strong> — Actual net proceeds will vary. Per-diem interest, tax prorations, and payoff amounts must be confirmed with your lender and title company. Commission is negotiable and subject to your listing agreement. Contact <strong>Chef J at realestatebychefj.com</strong> for a precise net sheet before listing.
          </div>
        </div>
      </div>
    </div>
  );
}
