import { useState, useEffect } from "react";
import { T, sans, serif, fc, fp, n } from "../shared/theme";
import { Field, DtiBar, SectionDivider } from "../shared/ui";

export default function DTICalc({ client, onUpdate }) {
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
