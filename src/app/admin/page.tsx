"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { T, sans, serif } from "@/components/shared/theme";
import { useFont } from "@/components/shared/use-font";
import { Field as FieldRaw } from "@/components/shared/ui";
// Field is defined in a .jsx file; cast to a permissive component type so
// the .tsx strict checker doesn't demand every destructured prop.
const Field = FieldRaw as React.ComponentType<any>;
import {
  isSupabaseConfigured,
  signInAgent,
  isCurrentUserAgent,
  signOut,
  getCurrentSession,
} from "@/lib/supabase";
import CRMDashboard from "@/components/CRMDashboard";

type Phase = "loading" | "needs-auth" | "not-authorized" | "authed" | "no-supabase";

export default function AdminPage() {
  useFont();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshPhase = useCallback(async () => {
    if (!isSupabaseConfigured()) { setPhase("no-supabase"); return; }
    const session = await getCurrentSession();
    if (!session) { setPhase("needs-auth"); return; }
    const ok = await isCurrentUserAgent();
    setPhase(ok ? "authed" : "not-authorized");
  }, []);

  useEffect(() => { refreshPhase(); }, [refreshPhase]);

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Email and password are required."); return; }
    setBusy(true);
    try {
      await signInAgent(email.trim().toLowerCase(), password);
      await refreshPhase();
    } catch (e: any) {
      setError(e?.message || "Sign in failed.");
    }
    setBusy(false);
  };

  const handleSignOut = async () => {
    await signOut();
    await refreshPhase();
  };

  // ─── Loading ────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, fontFamily: sans, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
        Loading…
      </div>
    );
  }

  // ─── Supabase not configured ───────────────────────────────────────
  if (phase === "no-supabase") {
    return (
      <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: sans }}>
        <div style={{ background: T.cream, borderRadius: 16, padding: "26px 22px", maxWidth: 420, width: "100%" }}>
          <div style={{ fontSize: 20, fontFamily: serif, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Agent CRM</div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
            The agent CRM requires Supabase to be configured. Copy <code>.env.local.example</code> to <code>.env.local</code>, fill in your project URL and anon key, then restart the dev server.
          </div>
          <Link href="/" style={{ display: "inline-block", marginTop: 16, color: T.gold, fontSize: 12 }}>← Back to client tools</Link>
        </div>
      </div>
    );
  }

  // ─── Signed in but not an agent ────────────────────────────────────
  if (phase === "not-authorized") {
    return (
      <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: sans }}>
        <div style={{ background: T.cream, borderRadius: 16, padding: "26px 22px", maxWidth: 420, width: "100%" }}>
          <div style={{ fontSize: 20, fontFamily: serif, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Not Authorized</div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 14 }}>
            This account is signed in but is not registered as an agent. Ask a project owner to add you to the <code>agents</code> table.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSignOut} style={{ flex: 1, padding: "10px", background: T.creamDark, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: sans, fontSize: 13, cursor: "pointer" }}>Sign out</button>
            <Link href="/" style={{ flex: 1, textAlign: "center", padding: "10px", background: T.navy, color: T.white, borderRadius: 8, fontFamily: sans, fontSize: 13, textDecoration: "none" }}>← Back</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Authed agent → CRM Dashboard ──────────────────────────────────
  if (phase === "authed") {
    return <CRMDashboard onClose={() => router.push("/")} />;
  }

  // ─── Sign-in form ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: sans }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>Real Estate by Chef J</div>
          <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>
            Agent <span style={{ color: T.goldLight }}>CRM</span>
          </div>
          <div style={{ fontSize: 12, color: "#7a8eaa", marginTop: 10 }}>Sign in with your agent account</div>
        </div>
        <div style={{ background: T.cream, borderRadius: 16, padding: "26px 22px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <Field label="Agent Email *" value={email} onChange={setEmail} type="email" placeholder="agent@email.com" />
          <Field label="Password *" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
          {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
          <button onClick={handleSignIn} disabled={busy} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Signing in…" : "Sign In →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 12 }}>
            <Link href="/" style={{ color: T.gold, textDecoration: "underline", textUnderlineOffset: 3 }}>← Back to client tools</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
