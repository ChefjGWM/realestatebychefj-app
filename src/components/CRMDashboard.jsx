import { useState, useEffect } from "react";
import { T, sans, serif, fc } from "./shared/theme";
import { isSupabaseConfigured, listClients } from "@/lib/supabase";

export default function CRMDashboard({ onClose }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      // Preferred path: Supabase
      if (isSupabaseConfigured()) {
        try {
          const rows = await listClients();
          if (rows) {
            setClients(rows);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Supabase listClients failed, falling back to window.storage", e);
        }
      }

      // Fallback: legacy window.storage
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
      <div style={{ background: T.navy, padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
