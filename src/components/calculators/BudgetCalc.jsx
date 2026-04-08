import { useState, useEffect } from "react";
import { T, sans, serif, fc, fp, n } from "../shared/theme";
import { Field, Result, SectionDivider } from "../shared/ui";

export default function BudgetCalc({ client, onUpdate }) {
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
