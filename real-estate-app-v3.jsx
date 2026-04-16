import { useState, useEffect, useCallback } from "react";

const WEBSITE_URL = "https://realestatebychefj.com";
const AGENT_PASSWORD = "agent2024"; // ← Change this

const T = {
  navy: "#0b1f3a", navyLight: "#132844", navyMid: "#1a3358",
  gold: "#c9a052", goldLight: "#e8c97a", goldFaint: "rgba(201,160,82,0.12)",
  cream: "#f5f0e8", creamDark: "#ede5d8", creamMid: "#e5ddd0",
  text: "#1a1a2e", muted: "#6b7a99", mutedLight: "#9aa3b8",
  green: "#2d7a4f", red: "#b5541a", white: "#ffffff", border: "#ddd5c4",
};

function useFont() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);
}

const fc = (v) => v == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fc2 = (v) => v == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
const fp = (v) => `${parseFloat(v || 0).toFixed(1)}%`;
const serif = "'Cormorant Garamond', serif";
const sans = "'DM Sans', sans-serif";
const n = (v) => parseFloat(v) || 0;

// ─── SHARED UI ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, prefix, suffix, type = "number", min, max, step = 1, placeholder, tooltip }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 5 }}>
        {label}
        {tooltip && <span title={tooltip} style={{ cursor: "help", fontSize: 11, color: T.gold, lineHeight: 1 }}>ⓘ</span>}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && <span style={{ position: "absolute", left: 11, color: T.gold, fontFamily: serif, fontWeight: 600, fontSize: 17, pointerEvents: "none" }}>{prefix}</span>}
        <input type={type} value={value} min={min} max={max} step={step} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: `9px ${suffix ? 38 : 12}px 9px ${prefix ? 26 : 12}px`, background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 15, fontFamily: sans, color: T.text, outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = T.gold}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        {suffix && <span style={{ position: "absolute", right: 10, color: T.muted, fontSize: 11, fontFamily: sans, pointerEvents: "none" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, tooltip }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 12, fontFamily: sans, color: T.text, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {tooltip && <span title={tooltip} style={{ cursor: "help", fontSize: 11, color: T.gold }}>ⓘ</span>}
      </span>
      <button onClick={() => onChange(!checked)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", background: checked ? T.gold : T.creamMid, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: T.white, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

function Result({ label, value, sub, accent, color, small }) {
  return (
    <div style={{ background: accent ? T.navy : T.creamDark, borderRadius: 10, padding: small ? "10px 14px" : "14px 18px", border: `1px solid ${accent ? T.gold : T.border}`, marginTop: 6 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: accent ? T.gold : T.muted, fontFamily: sans, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: small ? 20 : 26, fontFamily: serif, fontWeight: 700, color: color || (accent ? T.goldLight : T.navy), lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: accent ? "#aab8d0" : T.muted, marginTop: 2, fontFamily: sans }}>{sub}</div>}
    </div>
  );
}

function LineItem({ label, value, highlight, muted, tooltip }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 12, fontFamily: sans, color: muted ? T.muted : T.text, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {tooltip && <span title={tooltip} style={{ cursor: "help", fontSize: 10, color: T.gold }}>ⓘ</span>}
      </span>
      <span style={{ fontSize: highlight ? 15 : 13, fontFamily: serif, fontWeight: highlight ? 700 : 600, color: highlight ? T.navy : T.navy, flexShrink: 0, marginLeft: 8 }}>{fc(value)}<span style={{ fontSize: 10, color: T.muted, fontFamily: sans }}>/mo</span></span>
    </div>
  );
}

function DtiBar({ label, pct, max, thresholds }) {
  const clamped = Math.min(pct, max);
  const color = pct <= thresholds[0] ? T.green : pct <= thresholds[1] ? T.gold : T.red;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontFamily: sans, color: T.text }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: serif, fontWeight: 700, color }}>{fp(pct)}</span>
      </div>
      <div style={{ height: 7, background: T.creamMid, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(clamped / max) * 100}%`, background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.muted, fontFamily: sans, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

// ─── MORTGAGE + TRUE COST CALC ────────────────────────────────────────────────
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

function MortgageCalc({ client }) {
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

// ─── DOWN PAYMENT CALC ────────────────────────────────────────────────────────
function DownPaymentCalc() {
  const [price, setPrice] = useState(450000);
  const [savings, setSavings] = useState(2000);
  const [months, setMonths] = useState(24);
  const projected = n(savings) * n(months);
  const scenarios = [{ pct: 3, label: "3% — FHA Minimum" }, { pct: 5, label: "5% — Conventional" }, { pct: 10, label: "10% — Strong Offer" }, { pct: 20, label: "20% — No PMI ✓" }];
  return (
    <div>
      <Field label="Home Price" value={price} onChange={setPrice} prefix="$" step={1000} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Monthly Savings" value={savings} onChange={setSavings} prefix="$" step={100} />
        <Field label="Timeline" value={months} onChange={setMonths} suffix="mo" min={1} max={360} />
      </div>
      <div style={{ background: T.creamDark, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}`, marginTop: 8 }}>
        {scenarios.map(({ pct, label }) => {
          const needed = (n(price) * pct) / 100;
          const reached = projected >= needed;
          const moLeft = reached ? 0 : Math.ceil((needed - projected) / n(savings));
          return (
            <div key={pct} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontFamily: sans, color: T.text, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: sans }}>{fc(needed)} needed</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: reached ? T.green : T.red, fontFamily: sans }}>
                  {reached ? "✓ Reached!" : `${fc(needed - projected)} short`}
                </div>
                {!reached && n(savings) > 0 && <div style={{ fontSize: 10, color: T.muted, fontFamily: sans }}>{moLeft} more months</div>}
              </div>
            </div>
          );
        })}
      </div>
      <Result label={`Projected Savings in ${months} months`} value={fc(projected)} accent />
    </div>
  );
}

// ─── CLOSING COSTS ────────────────────────────────────────────────────────────
function ClosingCostsCalc() {
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

// ─── DTI CALC ─────────────────────────────────────────────────────────────────
function DTICalc({ client, onUpdate }) {
  const [income, setIncome]       = useState(client?.dti?.income || 8000);
  const [housing, setHousing]     = useState(client?.dti?.housing || 2000);
  const [car, setCar]             = useState(client?.dti?.car || 400);
  const [student, setStudent]     = useState(client?.dti?.student || 300);
  const [cards, setCards]         = useState(client?.dti?.cards || 150);
  const [other, setOther]         = useState(client?.dti?.other || 0);

  const totalDebt = n(car) + n(student) + n(cards) + n(other);
  const frontDTI = n(income) > 0 ? (n(housing) / n(income)) * 100 : 0;
  const backDTI  = n(income) > 0 ? ((n(housing) + totalDebt) / n(income)) * 100 : 0;
  const frontStatus = frontDTI <= 28 ? { label: "Excellent", color: T.green } : frontDTI <= 36 ? { label: "Good", color: T.gold } : { label: "High", color: T.red };
  const backStatus  = backDTI  <= 36 ? { label: "Excellent", color: T.green } : backDTI  <= 43 ? { label: "Acceptable", color: T.gold } : { label: "High Risk", color: T.red };

  useEffect(() => { if (onUpdate) onUpdate({ income, housing, car, student, cards, other, frontDTI: frontDTI.toFixed(1), backDTI: backDTI.toFixed(1) }); }, [income, housing, car, student, cards, other]);

  return (
    <div>
      <Field label="Gross Monthly Income" value={income} onChange={setIncome} prefix="$" step={100} />
      <SectionDivider label="Monthly Debt Payments" />
      <Field label="Proposed Housing Payment (PITI + HOA + CDD)" value={housing} onChange={setHousing} prefix="$" step={50} tooltip="Use the True Total from the Mortgage tab" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Car Payment(s)" value={car} onChange={setCar} prefix="$" step={25} />
        <Field label="Student Loans" value={student} onChange={setStudent} prefix="$" step={25} />
        <Field label="Credit Cards (min)" value={cards} onChange={setCards} prefix="$" step={10} />
        <Field label="Other Debt" value={other} onChange={setOther} prefix="$" step={10} />
      </div>
      <SectionDivider label="DTI Analysis" />
      <div style={{ background: T.creamDark, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}`, marginBottom: 8 }}>
        <DtiBar label="Front-End DTI (housing only)" pct={frontDTI} max={60} thresholds={[28, 36]} />
        <DtiBar label="Back-End DTI (all debts)" pct={backDTI} max={60} thresholds={[36, 43]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
          {[["Front-End", fp(frontDTI), frontStatus.color], ["Back-End", fp(backDTI), backStatus.color], ["Total Debt", fc(totalDebt) + "/mo", T.navy]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", background: T.white, borderRadius: 8, padding: "10px 6px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, fontFamily: sans }}>{l}</div>
              <div style={{ fontSize: 16, fontFamily: serif, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: T.navy, borderRadius: 10, padding: "14px 18px", border: `1px solid ${T.gold}` }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.gold, fontFamily: sans, marginBottom: 8 }}>Lender Guidelines</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["Front-End", frontStatus.label, frontStatus.color, "Ideal ≤ 28%"], ["Back-End", backStatus.label, backStatus.color, "Max 43% conv."], ["Max Housing", fc(Math.max(0, n(income) * 0.28 - totalDebt)), T.goldLight, "At 28% guideline"]].map(([l, v, c, sub]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: "#aab8d0", fontFamily: sans }}>{l}</div>
              <div style={{ fontSize: 14, fontFamily: serif, fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontSize: 9, color: "#7a8eaa", fontFamily: sans }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BUDGET CALC ──────────────────────────────────────────────────────────────
function BudgetCalc({ client, onUpdate }) {
  const [income, setIncome]           = useState(client?.budget_data?.income || 8000);
  const [pi, setPi]                   = useState(1600);
  const [propTax, setPropTax]         = useState(410);
  const [homeIns, setHomeIns]         = useState(200);
  const [pmi, setPmi]                 = useState(0);
  const [hoa, setHoa]                 = useState(0);
  const [cdd, setCdd]                 = useState(0);
  const [flood, setFlood]             = useState(0);
  const [utilities, setUtilities]     = useState(220);
  const [groceries, setGroceries]     = useState(600);
  const [transport, setTransport]     = useState(500);
  const [insurance, setInsurance]     = useState(300);
  const [childcare, setChildcare]     = useState(0);
  const [subscriptions, setSubs]      = useState(100);
  const [entertainment, setEnt]       = useState(200);
  const [savings, setSavings]         = useState(500);
  const [other, setOther]             = useState(200);

  const housing = n(pi) + n(propTax) + n(homeIns) + n(pmi) + n(hoa) + n(cdd) + n(flood);
  const nonHousing = n(utilities) + n(groceries) + n(transport) + n(insurance) + n(childcare) + n(subscriptions) + n(entertainment) + n(savings) + n(other);
  const total = housing + nonHousing;
  const leftover = n(income) - total;
  const housingPct = n(income) > 0 ? (housing / n(income)) * 100 : 0;

  useEffect(() => { if (onUpdate) onUpdate({ income, housing, totalExpenses: total, leftover, housingPct: housingPct.toFixed(1) }); }, [income, pi, propTax, homeIns, pmi, hoa, cdd, flood, utilities, groceries, transport, insurance, childcare, subscriptions, entertainment, savings, other]);

  const housingItems = [
    ["Principal & Interest", pi, setPi], ["Property Tax", propTax, setPropTax],
    ["Homeowners Insurance", homeIns, setHomeIns], ["PMI", pmi, setPmi],
    ["HOA Fee", hoa, setHoa], ["CDD Fee", cdd, setCdd],
    ["Flood Insurance", flood, setFlood],
  ];
  const livingItems = [
    ["Utilities", utilities, setUtilities], ["Groceries", groceries, setGroceries],
    ["Transportation", transport, setTransport], ["Personal Insurance", insurance, setInsurance],
    ["Childcare", childcare, setChildcare], ["Subscriptions", subscriptions, setSubs],
    ["Entertainment", entertainment, setEnt], ["Savings / Investments", savings, setSavings],
    ["Other", other, setOther],
  ];

  return (
    <div>
      <Field label="Gross Monthly Income" value={income} onChange={setIncome} prefix="$" step={100} />
      <SectionDivider label="Housing Costs (enter from Mortgage tab)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {housingItems.map(([lbl, val, set]) => <Field key={lbl} label={lbl} value={val} onChange={set} prefix="$" step={10} />)}
      </div>
      <div style={{ background: T.goldFaint, border: `1px solid ${T.gold}`, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#7a5500", fontFamily: sans }}>💡 Copy your <strong>True Total Monthly Cost</strong> from the Mortgage tab and break it down above for an accurate budget.</div>
      </div>
      <SectionDivider label="Living Expenses" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {livingItems.map(([lbl, val, set]) => <Field key={lbl} label={lbl} value={val} onChange={set} prefix="$" step={10} />)}
      </div>
      <SectionDivider label="Summary" />
      <div style={{ background: T.creamDark, borderRadius: 10, padding: "12px 16px", border: `1px solid ${T.border}` }}>
        {[["Total Housing", housing], ["Total Living Expenses", nonHousing], ["Total Monthly Expenses", total]].map(([l, v], i) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontWeight: i === 2 ? 700 : 400 }}>
            <span style={{ fontSize: i === 2 ? 13 : 12, fontFamily: sans, color: T.text }}>{l}</span>
            <span style={{ fontSize: i === 2 ? 16 : 13, fontFamily: serif, fontWeight: i === 2 ? 700 : 600, color: T.navy }}>{fc(v)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <Result label="Housing Ratio" value={fp(housingPct)} sub={housingPct <= 28 ? "✓ Within 28% guideline" : "⚠ Above 28%"} color={housingPct <= 28 ? T.green : T.red} small />
        <Result label="Income Used" value={fp(n(income) > 0 ? total / n(income) * 100 : 0)} sub={leftover >= 0 ? `${fc(leftover)} surplus` : "Over budget"} color={leftover >= 0 ? T.green : T.red} small />
      </div>
      <Result label={leftover >= 0 ? "Monthly Surplus" : "Monthly Shortfall"} value={fc(Math.abs(leftover))} sub={leftover >= 0 ? "Available after all expenses" : "Expenses exceed income — review costs"} color={leftover >= 0 ? T.goldLight : "#ff8c6b"} accent />
    </div>
  );
}

// ─── DIY CALC ─────────────────────────────────────────────────────────────────
function DIYCalc() {
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

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState(""); const [preapproved, setPreapproved] = useState("no");
  const [notes, setNotes] = useState(""); const [error, setError] = useState("");

  const handle = async () => {
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    const profile = { name: name.trim(), email: email.trim().toLowerCase(), phone, budget, preapproved, notes, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    try {
      const key = `crm:client:${profile.email}`;
      let existing = null;
      try { const r = await window.storage.get(key, true); if (r) existing = JSON.parse(r.value); } catch {}
      const merged = { ...existing, ...profile };
      await window.storage.set(key, JSON.stringify(merged), true);
      let index = [];
      try { const r = await window.storage.get("crm:index", true); if (r) index = JSON.parse(r.value); } catch {}
      if (!index.includes(profile.email)) { index.push(profile.email); await window.storage.set("crm:index", JSON.stringify(index), true); }
      onLogin(merged);
    } catch { onLogin(profile); }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: "max(40px, env(safe-area-inset-top, 40px)) 20px 40px", fontFamily: sans }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>Real Estate by Chef J</div>
          <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>Your Home Buying<br /><span style={{ color: T.goldLight }}>Toolkit</span></div>
          <div style={{ fontSize: 12, color: "#7a8eaa", marginTop: 10 }}>Enter your info to access your personalized calculators</div>
        </div>
        <div style={{ background: T.cream, borderRadius: 16, padding: "26px 22px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <Field label="Full Name *" value={name} onChange={setName} type="text" placeholder="Jane Smith" />
          <Field label="Email Address *" value={email} onChange={setEmail} type="email" placeholder="jane@email.com" />
          <Field label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="(555) 000-0000" />
          <Field label="Target Home Budget" value={budget} onChange={setBudget} prefix="$" step={10000} placeholder="450000" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 6 }}>Pre-Approved?</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["yes", "Yes ✓"], ["inprogress", "In Progress"], ["no", "Not Yet"]].map(([v, l]) => (
                <button key={v} onClick={() => setPreapproved(v)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1.5px solid ${preapproved === v ? T.gold : T.border}`, background: preapproved === v ? T.navy : T.white, color: preapproved === v ? T.goldLight : T.text, fontSize: 11, fontFamily: sans, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: T.muted, fontFamily: sans, marginBottom: 5 }}>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="First-time buyer, 3BR in North suburbs..."
              style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: sans, color: T.text, resize: "none", height: 65, outline: "none", boxSizing: "border-box", background: T.white }}
              onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
          {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
          <button onClick={handle} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Open My Calculators →
          </button>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: T.muted }}>Your info is shared securely with your agent.</div>
        </div>
      </div>
    </div>
  );
}

// ─── CRM DASHBOARD ────────────────────────────────────────────────────────────
function CRMDashboard({ onClose }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const idxRes = await window.storage.get("crm:index", true);
        const index = idxRes ? JSON.parse(idxRes.value) : [];
        const loaded = [];
        for (const email of index) {
          try { const r = await window.storage.get(`crm:client:${email}`, true); if (r) loaded.push(JSON.parse(r.value)); } catch {}
        }
        setClients(loaded.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const badge = (v) => {
    const map = { yes: [T.green, "Pre-Approved ✓"], no: [T.muted, "Not Pre-Approved"], inprogress: [T.gold, "In Progress"] };
    const [color, label] = map[v] || [T.muted, v];
    return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: color, color: T.white, fontFamily: sans, fontWeight: 500 }}>{label}</span>;
  };

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: sans }}>
      <div style={{ background: T.navy, paddingTop: "max(24px, env(safe-area-inset-top, 24px))", paddingBottom: 16, paddingLeft: 22, paddingRight: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.gold }}>Real Estate by Chef J</div>
          <div style={{ fontSize: 22, fontFamily: serif, fontWeight: 700, color: T.white }}>Agent CRM</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: T.goldFaint, border: `1px solid ${T.gold}`, borderRadius: 8, padding: "5px 12px", color: T.goldLight, fontSize: 12 }}>{clients.length} Client{clients.length !== 1 ? "s" : ""}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 14px", color: T.white, fontSize: 12, fontFamily: sans, cursor: "pointer" }}>← Back</button>
        </div>
      </div>
      <div style={{ padding: 18, maxWidth: 680, margin: "0 auto" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: T.muted }}>Loading…</div>}
        {!loading && clients.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontFamily: serif, fontSize: 22, color: T.navy }}>No clients yet</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>Clients appear here after signing in.</div>
          </div>
        )}
        {clients.map(c => (
          <div key={c.email} onClick={() => setSelected(selected?.email === c.email ? null : c)}
            style={{ background: T.white, borderRadius: 12, padding: "16px 18px", marginBottom: 10, border: `1.5px solid ${selected?.email === c.email ? T.gold : T.border}`, cursor: "pointer", transition: "border-color 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 17, fontFamily: serif, fontWeight: 700, color: T.navy }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{c.email}{c.phone ? ` · ${c.phone}` : ""}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                {badge(c.preapproved)}
                {c.budget && <div style={{ fontSize: 11, color: T.gold, fontFamily: serif, fontWeight: 600 }}>Budget: {fc(c.budget)}</div>}
              </div>
            </div>
            {selected?.email === c.email && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                {c.notes && <div style={{ fontSize: 12, color: T.text, fontFamily: sans, marginBottom: 10, background: T.creamDark, borderRadius: 8, padding: "8px 12px" }}>📝 {c.notes}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {c.dti && (
                    <div style={{ background: T.creamDark, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, marginBottom: 4, fontFamily: sans }}>DTI</div>
                      <div style={{ fontSize: 13, color: T.text, fontFamily: sans }}>Front: <strong style={{ color: c.dti.frontDTI > 36 ? T.red : T.green }}>{c.dti.frontDTI}%</strong></div>
                      <div style={{ fontSize: 13, color: T.text, fontFamily: sans }}>Back: <strong style={{ color: c.dti.backDTI > 43 ? T.red : T.green }}>{c.dti.backDTI}%</strong></div>
                      <div style={{ fontSize: 11, color: T.muted, fontFamily: sans }}>Income: {fc(c.dti.income)}/mo</div>
                    </div>
                  )}
                  {c.budget_data && (
                    <div style={{ background: T.creamDark, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, marginBottom: 4, fontFamily: sans }}>Budget</div>
                      <div style={{ fontSize: 13, color: T.text, fontFamily: sans }}>Housing: {fc(c.budget_data.housing)}/mo</div>
                      <div style={{ fontSize: 13, color: T.text, fontFamily: sans }}>Surplus: <strong style={{ color: c.budget_data.leftover >= 0 ? T.green : T.red }}>{fc(c.budget_data.leftover)}</strong></div>
                      <div style={{ fontSize: 11, color: T.muted, fontFamily: sans }}>Housing ratio: {c.budget_data.housingPct}%</div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: T.mutedLight, marginTop: 8, textAlign: "right", fontFamily: sans }}>
                  Updated: {new Date(c.updatedAt || c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess, onCancel }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,58,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: T.cream, borderRadius: 16, padding: "26px 22px", width: "100%", maxWidth: 320 }}>
        <div style={{ fontSize: 20, fontFamily: serif, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Agent Access</div>
        <div style={{ fontSize: 12, color: T.muted, fontFamily: sans, marginBottom: 16 }}>Enter your agent password to view CRM</div>
        <Field label="Password" value={pw} onChange={setPw} type="password" placeholder="••••••••" />
        {err && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>Incorrect password</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", background: T.creamDark, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: sans, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { if (pw === AGENT_PASSWORD) onSuccess(); else setErr(true); }} style={{ flex: 1, padding: "10px", background: T.navy, border: "none", borderRadius: 8, color: T.white, fontFamily: sans, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Enter →</button>
        </div>
      </div>
    </div>
  );
}

// ─── COMMISSION CALC ──────────────────────────────────────────────────────────
function CommissionCalc() {
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

// ─── SELLER NET SHEET ─────────────────────────────────────────────────────────
function SellerNetSheet({ onClose }) {
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
      <div style={{ background: T.navy, paddingTop: "max(28px, env(safe-area-inset-top, 28px))", paddingBottom: 16, paddingLeft: 18, paddingRight: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(201,160,82,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: T.gold, marginBottom: 3, fontFamily: sans }}>Real Estate by Chef J</div>
            <div style={{ fontSize: 22, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>
              Seller <span style={{ color: T.goldLight }}>Net Sheet</span>
            </div>
            <div style={{ fontSize: 11, color: "#7a8eaa", marginTop: 3, fontFamily: sans }}>See your estimated proceeds at 3 different sale prices</div>
          </div>
          <button onClick={onClose} style={{ background: "linear-gradient(135deg, #c9a052, #e8c97a)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#0b1f3a", fontSize: 12, fontFamily: sans, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
            ← Buyer Tools
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 16px 48px", maxWidth: 720, margin: "0 auto" }}>

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
        <div style={{ background: T.white, borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: "hidden", marginBottom: 12 }}>

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

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "budget",      label: "1. Budget",      icon: "🗂",  tip: "Know your monthly limits" },
  { id: "dti",         label: "2. DTI",          icon: "📊",  tip: "Check your debt ratios" },
  { id: "downpayment", label: "3. Down Pmt",     icon: "💰",  tip: "Plan your savings" },
  { id: "mortgage",    label: "4. Mortgage",     icon: "🏠",  tip: "Calculate your payment" },
  { id: "closing",     label: "5. Closing",      icon: "📋",  tip: "Understand closing costs" },
  { id: "commission",  label: "6. Commission",   icon: "🤝",  tip: "Agent fees & NAR changes" },
  { id: "diy",         label: "7. DIY Reno",     icon: "🔨",  tip: "Post-purchase renovations" },
];
const TITLES = {
  budget:      "Step 1 — Monthly Budget Planner",
  dti:         "Step 2 — Debt-to-Income Calculator",
  downpayment: "Step 3 — Down Payment Planner",
  mortgage:    "Step 4 — Mortgage & True Monthly Cost",
  closing:     "Step 5 — Closing Cost Estimator",
  commission:  "Step 6 — Realtor Commission & NAR Changes",
  diy:         "Step 7 — DIY Renovation Calculator",
};

export default function App() {
  useFont();
  const [client, setClient] = useState(null);
  const [active, setActive] = useState("budget");
  const [showCRM, setShowCRM] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSeller, setShowSeller] = useState(false);

  const saveClientData = useCallback(async (section, data) => {
    if (!client) return;
    const updated = { ...client, [section]: data, updatedAt: new Date().toISOString() };
    setClient(updated);
    try { await window.storage.set(`crm:client:${client.email}`, JSON.stringify(updated), true); } catch {}
  }, [client]);

  if (!client) return <LoginScreen onLogin={setClient} />;
  if (showCRM) return <CRMDashboard onClose={() => setShowCRM(false)} />;
  if (showSeller) return <SellerNetSheet onClose={() => setShowSeller(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: sans }}>
      {showAdminLogin && <AdminLogin onSuccess={() => { setShowAdminLogin(false); setShowCRM(true); }} onCancel={() => setShowAdminLogin(false)} />}

      <div style={{ background: T.navy, paddingTop: "max(24px, env(safe-area-inset-top, 24px))", paddingBottom: 0, paddingLeft: 16, paddingRight: 16, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(201,160,82,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: T.gold, marginBottom: 2, fontFamily: sans }}>Real Estate by Chef J</div>
            <div style={{ fontSize: 19, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.2 }}>
              Hi, <span style={{ color: T.goldLight }}>{client.name.split(" ")[0]}</span> 👋
            </div>
            {client.budget && <div style={{ fontSize: 10, color: "#7a8eaa", marginTop: 1, fontFamily: sans }}>Budget: {fc(client.budget)}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            <button onClick={() => window.open(WEBSITE_URL, "_blank")} style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 8, padding: "7px 12px", fontFamily: sans, fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
              🔍 Search Properties
            </button>
            <button onClick={() => setShowSeller(true)} style={{ background: "rgba(201,160,82,0.15)", border: `1px solid rgba(201,160,82,0.35)`, borderRadius: 8, padding: "6px 12px", color: T.goldLight, fontSize: 11, fontFamily: sans, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
              🏡 Seller Tools
            </button>
            <button onClick={() => setShowAdminLogin(true)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 6, padding: "5px 12px", color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: sans, cursor: "pointer", letterSpacing: 1 }}>
              AGENT LOGIN
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{ padding: "7px 9px", borderRadius: "6px 6px 0 0", border: "none", background: active === tab.id ? T.cream : "transparent", color: active === tab.id ? T.navy : "rgba(255,255,255,0.5)", fontSize: 10.5, fontFamily: sans, fontWeight: active === tab.id ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        {/* Active step hint */}
        <div style={{ background: T.goldFaint, borderTop: `1px solid rgba(201,160,82,0.2)`, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: T.gold, fontFamily: sans, letterSpacing: 1 }}>▶</span>
          <span style={{ fontSize: 10, color: T.goldLight, fontFamily: sans }}>{TABS.find(t => t.id === active)?.tip}</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: sans }}>Step {TABS.findIndex(t => t.id === active) + 1} of {TABS.length}</span>
        </div>
      </div>

      <div style={{ padding: "20px 16px 48px", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: serif, fontSize: 20, color: T.navy, fontWeight: 700, margin: "0 0 16px" }}>{TITLES[active]}</h2>
        {active === "mortgage"     && <MortgageCalc client={client} />}
        {active === "downpayment"  && <DownPaymentCalc />}
        {active === "closing"      && <ClosingCostsCalc />}
        {active === "dti"          && <DTICalc client={client} onUpdate={d => saveClientData("dti", d)} />}
        {active === "budget"       && <BudgetCalc client={client} onUpdate={d => saveClientData("budget_data", d)} />}
        {active === "diy"          && <DIYCalc />}
        {active === "commission"   && <CommissionCalc />}
      </div>

      <div style={{ background: T.navy, padding: "14px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: sans, lineHeight: 1.6 }}>
          realestatebychefj.com · Estimates for informational purposes only. Consult your lender & agent for exact figures.
        </div>
      </div>
    </div>
  );
}
