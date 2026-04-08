import { useState } from "react";
import { T, sans, serif, fc, n } from "../shared/theme";
import { Field, Toggle, Result, SectionDivider } from "../shared/ui";

export default function ClosingCostsCalc() {
  const [price, setPrice] = useState(450000);
  const [loan, setLoan] = useState(360000);
  const [state, setState] = useState("FL");
  const [hasCDD, setHasCDD] = useState(false);
  const [hasHOA, setHasHOA] = useState(false);
  const [hoaTransfer, setHoaTransfer] = useState(500);

  const txRates = { FL: 0.7, CA: 0.11, TX: 0.8, NY: 1.65, GA: 0.1, NC: 0.2, AZ: 0.1, CO: 0.1 };
  const ttx = txRates[state] ?? 0.1;

  const items = [
    { label: "Loan Origination Fee (1%)", value: n(loan) * 0.01, note: "Lender fee" },
    { label: "Appraisal Fee", value: 575, note: "Licensed appraiser" },
    { label: "Credit Report", value: 45, note: "Per borrower" },
    { label: "Title Insurance (Owner)", value: n(price) * 0.005, note: "One-time, protects buyer" },
    { label: "Title Insurance (Lender)", value: n(loan) * 0.003, note: "Required by lender" },
    { label: "Title Search & Settlement", value: 750, note: "Title company/attorney" },
    { label: "Home Inspection", value: 400, note: "General inspection" },
    { label: "WDO / Termite Inspection", value: 125, note: "Common in FL" },
    { label: "Wind Mitigation Report", value: 150, note: "May lower ins. premium" },
    { label: "4-Point Inspection", value: 200, note: "Roof/HVAC/Plumbing/Electric" },
    { label: "Survey", value: 500, note: "Boundary/location survey" },
    { label: `Doc Stamp / Transfer Tax (${ttx}%)`, value: (n(price) * ttx) / 100, note: `${state} rate` },
    { label: "Mortgage Doc Stamp (FL)", value: state === "FL" ? n(loan) * 0.0035 : 0, note: "FL only: 0.35% of loan" },
    { label: "Intangible Tax (FL)", value: state === "FL" ? n(loan) * 0.002 : 0, note: "FL only: 0.2% of loan" },
    { label: "Recording Fees", value: 300, note: "County clerk" },
    { label: "Prepaid Interest (15 days)", value: (n(loan) * 0.068) / 365 * 15, note: "Est. at current rate" },
    { label: "Homeowners Insurance (1yr)", value: n(price) * 0.0055, note: "Collected at closing" },
    { label: "Property Tax Escrow (2mo)", value: (n(price) * 0.011) / 6, note: "Initial escrow reserve" },
    ...(hasHOA ? [
      { label: "HOA Transfer/Estoppel Fee", value: n(hoaTransfer), note: "Varies by association" },
      { label: "HOA Capital Contribution", value: 500, note: "Initiation fee, if applicable" },
    ] : []),
    ...(hasCDD ? [{ label: "CDD Estoppel Fee", value: 300, note: "CDD balance verification" }] : []),
  ].filter(i => i.value > 0);

  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Purchase Price" value={price} onChange={setPrice} prefix="$" step={1000} />
        <Field label="Loan Amount" value={loan} onChange={setLoan} prefix="$" step={1000} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 5 }}>State</label>
        <select value={state} onChange={e => setState(e.target.value)} style={{ width: "100%", padding: "9px 12px", background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 14, fontFamily: sans, color: T.text, outline: "none" }}>
          {Object.keys(txRates).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <SectionDivider label="Community Fees at Closing" />
      <Toggle label="HOA Community" checked={hasHOA} onChange={setHasHOA} tooltip="Add HOA transfer, estoppel & capital contribution fees" />
      {hasHOA && <Field label="HOA Transfer / Estoppel Fee" value={hoaTransfer} onChange={setHoaTransfer} prefix="$" step={50} tooltip="Typically $200–$900, contact HOA for exact amount" />}
      <Toggle label="CDD Community" checked={hasCDD} onChange={setHasCDD} tooltip="Adds CDD estoppel letter fee at closing" />

      <SectionDivider label="Itemized Costs" />
      <div style={{ background: T.creamDark, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.border}` }}>
        {items.map(({ label, value, note }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.border}` }}>
            <div>
              <div style={{ fontSize: 12, color: T.text, fontFamily: sans }}>{label}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: sans }}>{note}</div>
            </div>
            <span style={{ fontSize: 13, fontFamily: serif, fontWeight: 600, color: T.navy, flexShrink: 0, marginLeft: 10 }}>{fc(value)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <Result label="Est. Closing Costs" value={fc(total)} sub={`${((total / n(price)) * 100).toFixed(1)}% of price`} small />
        <Result label="Cash to Close (est.)" value={fc(total + (n(price) - n(loan)))} sub="Down pmt + closing" small />
      </div>
      <Result label="Total Estimated Closing Costs" value={fc(total)} sub="Ask your agent for a Loan Estimate for exact figures" accent />
    </div>
  );
}
