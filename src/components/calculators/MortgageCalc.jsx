import { useState } from "react";
import { T, serif, sans, fc, n } from "../shared/theme";
import { Field, Toggle, Result, LineItem, SectionDivider } from "../shared/ui";

const LOAN_TYPES = [
  { id: "conv20",  label: "Conventional — 20% Down",        pct: 20,   rate: 6.75, years: 30, pmi: false, mip: false, note: "Best rate. No PMI required.",                       badge: "No PMI" },
  { id: "conv15",  label: "Conventional — 15% Down",        pct: 15,   rate: 6.85, years: 30, pmi: true,  mip: false, note: "PMI until 20% equity reached.",                     badge: null },
  { id: "conv10",  label: "Conventional — 10% Down",        pct: 10,   rate: 6.90, years: 30, pmi: true,  mip: false, note: "PMI until 20% equity reached.",                     badge: null },
  { id: "conv5",   label: "Conventional — 5% Down",         pct: 5,    rate: 7.00, years: 30, pmi: true,  mip: false, note: "PMI until 20% equity. Lower cash needed upfront.",  badge: null },
  { id: "conv3",   label: "Conventional 97 — 3% Down",      pct: 3,    rate: 7.10, years: 30, pmi: true,  mip: false, note: "First-time buyers. PMI required.",                  badge: "1st-Time Buyer" },
  { id: "fha35",   label: "FHA Loan — 3.5% Down",           pct: 3.5,  rate: 6.80, years: 30, pmi: false, mip: true,  note: "Min 580 credit score. MIP lasts life of loan.",     badge: "FHA" },
  { id: "fha10",   label: "FHA Loan — 10% Down",            pct: 10,   rate: 6.80, years: 30, pmi: false, mip: true,  note: "Credit 500–579. MIP for 11 years.",                 badge: "FHA" },
  { id: "va",      label: "VA Loan — 0% Down",              pct: 0,    rate: 6.40, years: 30, pmi: false, mip: false, note: "Veterans/active military only. No PMI or MIP.",     badge: "Veterans" },
  { id: "usda",    label: "USDA Loan — 0% Down",            pct: 0,    rate: 6.35, years: 30, pmi: false, mip: false, note: "Rural/suburban areas. Income limits apply.",         badge: "Rural" },
  { id: "jumbo",   label: "Jumbo Loan — 20%+ Down",         pct: 20,   rate: 7.25, years: 30, pmi: false, mip: false, note: "Loans above $766,550 (2024 conforming limit).",     badge: "Jumbo" },
  { id: "arm5",    label: "5/1 ARM — 10% Down",             pct: 10,   rate: 6.25, years: 30, pmi: true,  mip: false, note: "Fixed 5 yrs, adjusts annually after. Rate may rise.",badge: "ARM" },
  { id: "other",   label: "Other / Enter Manually",         pct: null, rate: 6.80, years: 30, pmi: true,  mip: false, note: "Enter your own down payment amount.",               badge: null },
];

export default function MortgageCalc({ client }) {
  const [price, setPrice]           = useState(450000);
  const [loanTypeId, setLoanTypeId] = useState("conv20");
  const [customDown, setCustomDown] = useState(90000);
  const [rate, setRate]             = useState(6.75);
  const [years, setYears]           = useState(30);
  const [propTaxRate, setPropTaxRate] = useState(1.1);
  const [insurance, setInsurance]   = useState(2400);
  const [hoa, setHoa]               = useState(0);
  const [cdd, setCdd]               = useState(0);
  const [flood, setFlood]           = useState(0);
  const [melloRoos, setMelloRoos]   = useState(0);
  const [showFlood, setShowFlood]   = useState(false);
  const [showMello, setShowMello]   = useState(false);
  const [showCDD, setShowCDD]       = useState(false);

  const loanType = LOAN_TYPES.find(l => l.id === loanTypeId) || LOAN_TYPES[0];
  const isOther  = loanTypeId === "other";
  const down     = isOther ? n(customDown) : (n(price) * loanType.pct) / 100;
  const downPct  = n(price) > 0 ? (down / n(price)) * 100 : 0;

  // When loan type changes, update rate & years to match defaults
  const handleLoanType = (id) => {
    const lt = LOAN_TYPES.find(l => l.id === id);
    setLoanTypeId(id);
    setRate(lt.rate);
    setYears(lt.years);
  };

  const loan = Math.max(0, n(price) - down);

  // PMI: conventional when < 20% down
  const needsPMI   = loanType.pmi && downPct < 20 && loan > 0;
  const pmiMonthly = needsPMI ? (loan * 0.0085) / 12 : 0;

  // FHA MIP: upfront 1.75% (rolled in) + annual 0.55% monthly
  const mipMonthly = loanType.mip ? (loan * 0.0055) / 12 : 0;

  // VA Funding Fee: ~2.3% of loan (one-time, typically rolled in) — informational
  const vaFunding  = loanTypeId === "va" ? loan * 0.023 : 0;

  const mr = n(rate) / 100 / 12;
  const N  = n(years) * 12;
  const pi = mr > 0 ? (loan * (mr * Math.pow(1 + mr, N))) / (Math.pow(1 + mr, N) - 1) : loan / N;

  const propTaxMonthly  = (n(price) * n(propTaxRate) / 100) / 12;
  const insuranceMonthly = n(insurance) / 12;
  const cddMonthly      = n(cdd) / 12;
  const floodMonthly    = n(flood) / 12;
  const melloMonthly    = n(melloRoos) / 12;
  const hoaMonthly      = n(hoa);
  const miMonthly       = pmiMonthly + mipMonthly;

  const piti         = pi + propTaxMonthly + insuranceMonthly;
  const totalMonthly = piti + hoaMonthly + cddMonthly + miMonthly
                     + (showFlood ? floodMonthly : 0)
                     + (showMello ? melloMonthly : 0);

  const badgeColors = { "No PMI": T.green, "1st-Time Buyer": "#5b7fd4", "FHA": "#7a55cc", "Veterans": "#2d6ea0", "Rural": "#4a8c55", "Jumbo": "#a06020", "ARM": T.red };

  return (
    <div>
      <SectionDivider label="Loan Type" />

      {/* Loan Type Selector */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 6 }}>Select Loan Program</label>
        <div style={{ position: "relative" }}>
          <select value={loanTypeId} onChange={e => handleLoanType(e.target.value)}
            style={{ width: "100%", padding: "11px 36px 11px 14px", background: T.navy, border: `1.5px solid ${T.gold}`, borderRadius: 10, fontSize: 14, fontFamily: sans, color: T.white, outline: "none", appearance: "none", cursor: "pointer", fontWeight: 500 }}>
            {LOAN_TYPES.map(lt => <option key={lt.id} value={lt.id}>{lt.label}</option>)}
          </select>
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.gold, pointerEvents: "none", fontSize: 12 }}>▼</span>
        </div>

        {/* Loan Type Info Card */}
        <div style={{ marginTop: 8, background: T.creamDark, borderRadius: 8, padding: "10px 14px", border: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontFamily: serif, fontWeight: 700, color: T.navy }}>{loanType.label}</span>
              {loanType.badge && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: badgeColors[loanType.badge] || T.muted, color: T.white, fontFamily: sans, fontWeight: 600, letterSpacing: 0.5 }}>{loanType.badge}</span>}
            </div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: sans, lineHeight: 1.5 }}>{loanType.note}</div>
          </div>
          {!isOther && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontFamily: serif, fontWeight: 700, color: T.navy }}>{loanType.pct}%</div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: sans }}>down</div>
            </div>
          )}
        </div>
      </div>

      <SectionDivider label="Loan Details" />
      <Field label="Home Price" value={price} onChange={setPrice} prefix="$" step={1000} />

      {/* Down Payment — auto or manual */}
      {isOther ? (
        <Field label="Down Payment (Custom)" value={customDown} onChange={setCustomDown} prefix="$" step={1000} />
      ) : (
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: "block", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 5 }}>Down Payment</label>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, padding: "9px 14px", background: T.creamDark, border: `1.5px solid ${T.border}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontFamily: sans, color: T.text, fontWeight: 500 }}>{fc(down)}</span>
              <span style={{ fontSize: 11, color: T.gold, fontFamily: serif, fontWeight: 600 }}>{downPct.toFixed(1)}%</span>
            </div>
            <button onClick={() => { setLoanTypeId("other"); setCustomDown(Math.round(down)); }}
              style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.white, color: T.muted, fontSize: 11, fontFamily: sans, cursor: "pointer", whiteSpace: "nowrap" }}>
              Edit ✏️
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Interest Rate" value={rate} onChange={setRate} suffix="%" step={0.05} />
        <Field label="Loan Term" value={years} onChange={setYears} suffix="yrs" min={1} max={40} />
      </div>

      {/* Loan Summary chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        {[["Loan Amount", fc(loan)], ["Down", fc(down) + ` (${downPct.toFixed(1)}%)`], ["Total Interest", fc((pi * N) - loan)]].map(([l, v]) => (
          <div key={l} style={{ background: T.creamDark, borderRadius: 20, padding: "4px 12px", border: `1px solid ${T.border}`, display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.muted, fontFamily: sans }}>{l}:</span>
            <span style={{ fontSize: 11, fontFamily: serif, fontWeight: 700, color: T.navy }}>{v}</span>
          </div>
        ))}
      </div>

      {/* VA Funding Fee notice */}
      {loanTypeId === "va" && vaFunding > 0 && (
        <div style={{ background: "#e8f3fb", border: "1px solid #2d6ea0", borderRadius: 8, padding: "9px 13px", marginBottom: 8, fontSize: 11, color: "#1a4a6e", fontFamily: sans, lineHeight: 1.5 }}>
          🎖️ <strong>VA Funding Fee:</strong> ~{fc(vaFunding)} (2.3% of loan, typically rolled into the loan amount). First-time VA use. May be waived for disabled veterans.
        </div>
      )}
      {loanType.mip && (
        <div style={{ background: "#f0ebfa", border: "1px solid #7a55cc", borderRadius: 8, padding: "9px 13px", marginBottom: 8, fontSize: 11, color: "#4a2a8a", fontFamily: sans, lineHeight: 1.5 }}>
          🏛️ <strong>FHA MIP:</strong> Upfront 1.75% (~{fc(loan * 0.0175)}) rolled into loan + {fc(mipMonthly)}/mo annual MIP. With &lt;10% down, MIP lasts the life of the loan.
        </div>
      )}

      <SectionDivider label="Taxes & Insurance" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Property Tax Rate" value={propTaxRate} onChange={setPropTaxRate} suffix="% /yr"
          step={0.05} tooltip="Annual property tax as % of home value. FL avg ~1.1%" />
        <Field label="Homeowners Ins." value={insurance} onChange={setInsurance} prefix="$" suffix="/yr"
          tooltip="Annual homeowners insurance premium" />
      </div>

      <SectionDivider label="Community & HOA Fees" />
      <Field label="HOA Fee" value={hoa} onChange={setHoa} prefix="$" suffix="/mo"
        tooltip="Monthly Homeowners Association fee. Covers community amenities, maintenance." />

      <Toggle label="CDD Fee (Community Development District)" checked={showCDD} onChange={setShowCDD}
        tooltip="Annual fee billed through property taxes. Common in FL master-planned communities." />
      {showCDD && <Field label="CDD Annual Amount" value={cdd} onChange={setCdd} prefix="$" suffix="/yr"
        tooltip="Pays for infrastructure like roads, utilities. Typically $500–$3,000/yr in FL." />}

      <Toggle label="Flood Insurance" checked={showFlood} onChange={setShowFlood}
        tooltip="Required in FEMA flood zones. Annual premium varies widely by zone." />
      {showFlood && <Field label="Flood Insurance Premium" value={flood} onChange={setFlood} prefix="$" suffix="/yr"
        tooltip="Check FloodSmart.gov for zone-based estimates. FL avg ~$900–$2,500/yr." />}

      <Toggle label="Special Assessment / Mello-Roos" checked={showMello} onChange={setShowMello}
        tooltip="Additional special district assessment. Ask your agent if community has any." />
      {showMello && <Field label="Special Assessment Annual" value={melloRoos} onChange={setMelloRoos} prefix="$" suffix="/yr" />}

      <SectionDivider label="Full Monthly Payment Breakdown" />
      <div style={{ background: T.creamDark, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}` }}>
        <LineItem label="Principal & Interest" value={pi} />
        <LineItem label="Property Tax" value={propTaxMonthly} tooltip={`${propTaxRate}% of ${fc(price)} ÷ 12`} />
        <LineItem label="Homeowners Insurance" value={insuranceMonthly} />
        {needsPMI    && <LineItem label="PMI (Private Mortgage Ins.)" value={pmiMonthly} tooltip="Required when down payment < 20%. Drops off at 80% LTV." />}
        {loanType.mip && <LineItem label="FHA MIP (Annual)" value={mipMonthly} tooltip="FHA Mortgage Insurance Premium — 0.55%/yr of loan balance." />}
        {hoaMonthly > 0 && <LineItem label="HOA Fee" value={hoaMonthly} />}
        {showCDD && cddMonthly > 0 && <LineItem label="CDD Fee" value={cddMonthly} tooltip="Annual CDD ÷ 12" />}
        {showFlood && floodMonthly > 0 && <LineItem label="Flood Insurance" value={floodMonthly} />}
        {showMello && melloMonthly > 0 && <LineItem label="Special Assessment" value={melloMonthly} />}
        <div style={{ paddingTop: 8, marginTop: 4, borderTop: `2px solid ${T.navy}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontFamily: sans, fontWeight: 600, color: T.navy }}>Total Monthly Payment</span>
          <span style={{ fontSize: 22, fontFamily: serif, fontWeight: 700, color: T.navy }}>{fc(totalMonthly)}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <Result label="P&I Only" value={fc(pi)} sub={`${downPct.toFixed(1)}% down · ${years}yr`} small />
        <Result label="PITI" value={fc(piti)} sub="Tax & ins. included" small />
      </div>
      {needsPMI && (
        <div style={{ background: "#fff8ec", border: `1px solid ${T.gold}`, borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
          <div style={{ fontSize: 11, fontFamily: sans, color: "#7a5500" }}>⚠️ <strong>PMI: {fc(pmiMonthly)}/mo</strong> — drops off at 80% LTV ({fc(loan * 0.8)} balance). Put down {fc((n(price) * 0.2) - down)} more to avoid it entirely.</div>
        </div>
      )}
      <Result label="True Total Monthly Cost" value={fc(totalMonthly)} sub="All fees, taxes, insurance & assessments" accent />
    </div>
  );
}
