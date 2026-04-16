"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { T, sans, serif, fc, WEBSITE_URL } from "@/components/shared/theme";
import { useFont } from "@/components/shared/use-font";
import { isSupabaseConfigured, updateClientSection, getCurrentClient, signOut } from "@/lib/supabase";
import LoginScreen from "@/components/LoginScreen";
import MortgageCalc from "@/components/calculators/MortgageCalc";
import DownPaymentCalc from "@/components/calculators/DownPaymentCalc";
import ClosingCostsCalc from "@/components/calculators/ClosingCostsCalc";
import DTICalc from "@/components/calculators/DTICalc";
import BudgetCalc from "@/components/calculators/BudgetCalc";
import DIYCalc from "@/components/calculators/DIYCalc";
import CommissionCalc from "@/components/calculators/CommissionCalc";
import SellerNetSheet from "@/components/calculators/SellerNetSheet";

const TABS = [
  { id: "budget",      label: "1. Budget",      icon: "🗂",  tip: "Know your monthly limits" },
  { id: "dti",         label: "2. DTI",          icon: "📊",  tip: "Check your debt ratios" },
  { id: "downpayment", label: "3. Down Pmt",     icon: "💰",  tip: "Plan your savings" },
  { id: "mortgage",    label: "4. Mortgage",     icon: "🏠",  tip: "Calculate your payment" },
  { id: "closing",     label: "5. Closing",      icon: "📋",  tip: "Understand closing costs" },
  { id: "commission",  label: "6. Commission",   icon: "🤝",  tip: "Agent fees & NAR changes" },
  { id: "diy",         label: "7. DIY Reno",     icon: "🔨",  tip: "Post-purchase renovations" },
];
const TITLES: Record<string, string> = {
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
  const [client, setClient] = useState<any>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [active, setActive] = useState("budget");
  const [showSeller, setShowSeller] = useState(false);

  // On mount: restore Supabase session if any, and load the client row.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          const restored = await getCurrentClient();
          if (!cancelled && restored) setClient(restored);
        } catch {}
      }
      if (!cancelled) setBootstrapping(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Dynamic <title> per mode (buyer tools vs seller net sheet).
  useEffect(() => {
    document.title = showSeller
      ? "Seller Net Sheet | Real Estate by Chef J"
      : "Home Buyer Tools | Real Estate by Chef J";
  }, [showSeller]);

  const handleSignOut = useCallback(async () => {
    try { await signOut(); } catch {}
    setClient(null);
  }, []);

  const saveClientData = useCallback(async (section: string, data: any) => {
    if (!client) return;
    const updated = { ...client, [section]: data, updatedAt: new Date().toISOString() };
    setClient(updated);

    // Fire-and-forget agent notification on DTI / budget updates.
    if (section === "dti" || section === "budget_data") {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: section === "dti" ? "dti" : "budget",
          client: { name: client.name, email: client.email },
          data,
        }),
      }).catch(() => {});
    }

    // Preferred path: Supabase
    if (isSupabaseConfigured() && (section === "dti" || section === "budget_data")) {
      try {
        await updateClientSection(client.email, section, data);
        return;
      } catch (e) {
        console.warn("Supabase update failed, falling back to window.storage", e);
      }
    }

    // Fallback: legacy window.storage
    try { await (window as any).storage.set(`crm:client:${client.email}`, JSON.stringify(updated), true); } catch {}
  }, [client]);

  if (bootstrapping) {
    return (
      <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, fontFamily: sans, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
        Loading…
      </div>
    );
  }
  if (!client) return <LoginScreen onLogin={setClient} />;
  if (showSeller) return <SellerNetSheet onClose={() => setShowSeller(false)} />;

  return (
    <div className="app-shell" style={{ minHeight: "100vh", background: T.cream, fontFamily: sans }}>
      <div className="resp-sticky" style={{ background: T.navy, paddingTop: "max(24px, env(safe-area-inset-top, 24px))", paddingBottom: 0, paddingLeft: 16, paddingRight: 16, overflow: "hidden", position: "sticky", top: 0, zIndex: 50 }}>
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
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={handleSignOut} title="Sign out" style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: sans, cursor: "pointer", letterSpacing: 1 }}>
                SIGN OUT
              </button>
              <Link href="/admin" style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: sans, letterSpacing: 1, textDecoration: "none" }}>
                AGENT
              </Link>
            </div>
          </div>
        </div>
        <div className="resp-tabs" style={{ display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
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

      <div className="resp-form" style={{ padding: "20px 16px 48px", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: serif, fontSize: 20, color: T.navy, fontWeight: 700, margin: "0 0 16px" }}>{TITLES[active]}</h2>
        {active === "mortgage"     && <MortgageCalc client={client} />}
        {active === "downpayment"  && <DownPaymentCalc />}
        {active === "closing"      && <ClosingCostsCalc />}
        {active === "dti"          && <DTICalc client={client} onUpdate={(d: any) => saveClientData("dti", d)} />}
        {active === "budget"       && <BudgetCalc client={client} onUpdate={(d: any) => saveClientData("budget_data", d)} />}
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
