import { T, serif, sans, fc, fp } from "./theme";

export function Field({ label, value, onChange, prefix, suffix, type = "number", min, max, step = 1, placeholder, tooltip }) {
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
          style={{ width: "100%", padding: `10px ${suffix ? 38 : 12}px 10px ${prefix ? 26 : 12}px`, background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 16, fontFamily: sans, color: T.text, outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = T.gold}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        {suffix && <span style={{ position: "absolute", right: 10, color: T.muted, fontSize: 11, fontFamily: sans, pointerEvents: "none" }}>{suffix}</span>}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, tooltip }) {
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

export function Result({ label, value, sub, accent, color, small }) {
  return (
    <div style={{ background: accent ? T.navy : T.creamDark, borderRadius: 10, padding: small ? "10px 14px" : "14px 18px", border: `1px solid ${accent ? T.gold : T.border}`, marginTop: 6 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: accent ? T.gold : T.muted, fontFamily: sans, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: small ? 20 : 26, fontFamily: serif, fontWeight: 700, color: color || (accent ? T.goldLight : T.navy), lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: accent ? "#aab8d0" : T.muted, marginTop: 2, fontFamily: sans }}>{sub}</div>}
    </div>
  );
}

export function LineItem({ label, value, highlight, muted, tooltip }) {
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

export function DtiBar({ label, pct, max, thresholds }) {
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

export function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.muted, fontFamily: sans, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}
