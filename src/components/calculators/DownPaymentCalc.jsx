import { useState } from "react";
import { T, sans, serif, fc, n } from "../shared/theme";
import { Field, Result } from "../shared/ui";

export default function DownPaymentCalc() {
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
