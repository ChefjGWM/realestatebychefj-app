import { useState } from "react";
import { T, sans, serif } from "./shared/theme";
import { Field } from "./shared/ui";
import {
  isSupabaseConfigured,
  signInClient,
  signUpClient,
  sendPasswordReset,
  upsertClient,
} from "@/lib/supabase";

// Fire-and-forget notification (logs server-side if Resend isn't configured).
const notify = (body) =>
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});

export default function LoginScreen({ onLogin }) {
  const supabaseOn = isSupabaseConfigured();
  const [mode, setMode] = useState("signin"); // signin | register | forgot

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Register-only
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [preapproved, setPreapproved] = useState("no");
  const [notes, setNotes] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const handleSignIn = async () => {
    setError(""); setInfo("");
    if (!email.trim() || !password) { setError("Email and password are required."); return; }
    setBusy(true);
    try {
      const client = await signInClient(email.trim().toLowerCase(), password);
      onLogin(client);
    } catch (e) {
      setError(e?.message || "Sign in failed.");
    }
    setBusy(false);
  };

  const handleRegister = async () => {
    setError(""); setInfo("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const client = await signUpClient({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone, budget, preapproved, notes,
      });
      // Notify the agent of the new registration regardless of email-confirm state.
      notify({
        type: "register",
        client: { name: name.trim(), email: email.trim().toLowerCase(), phone, budget, preapproved, notes },
      });
      if (client) {
        onLogin(client);
      } else {
        setInfo("Account created — check your email to confirm, then sign in.");
        setMode("signin");
        setPassword("");
      }
    } catch (e) {
      setError(e?.message || "Sign up failed.");
    }
    setBusy(false);
  };

  const handleForgot = async () => {
    setError(""); setInfo("");
    if (!email.trim()) { setError("Enter your email first."); return; }
    setBusy(true);
    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setInfo("Password reset email sent. Check your inbox.");
    } catch (e) {
      setError(e?.message || "Could not send reset email.");
    }
    setBusy(false);
  };

  // ─── Legacy fallback (Supabase not configured): name-only flow ────────
  const handleLegacy = async () => {
    setError("");
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    const profile = { name: name.trim(), email: email.trim().toLowerCase(), phone, budget, preapproved, notes, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    notify({ type: "register", client: profile });
    if (isSupabaseConfigured()) {
      try { const saved = await upsertClient(profile); onLogin({ ...profile, ...(saved || {}) }); return; }
      catch (e) { console.warn("Supabase upsert failed", e); }
    }
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

  // ─── Headline copy per mode ──────────────────────────────────────────
  const headlines = {
    signin:   { line1: "Welcome",                   line2: "Back",     sub: "Sign in to access your personalized calculators" },
    register: { line1: "Your Home Buying",          line2: "Toolkit",  sub: "Create an account to save your progress" },
    forgot:   { line1: "Reset Your",                line2: "Password", sub: "Enter your email and we'll send you a reset link" },
    demo:     { line1: "Your Home Buying",          line2: "Toolkit",  sub: "Enter your info to access your personalized calculators" },
  };
  const headline = supabaseOn ? headlines[mode] : headlines.demo;

  // ─── Linkish text button (footer-style toggles) ───────────────────────
  const LinkBtn = ({ children, onClick }) => (
    <button type="button" onClick={onClick} disabled={busy}
      style={{ background: "none", border: "none", color: T.gold, fontFamily: sans, fontSize: 12, cursor: busy ? "default" : "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
      {children}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: "max(40px, env(safe-area-inset-top, 40px)) 20px 40px", fontFamily: sans }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>Real Estate by Chef J</div>
          <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>{headline.line1}<br /><span style={{ color: T.goldLight }}>{headline.line2}</span></div>
          <div style={{ fontSize: 12, color: "#7a8eaa", marginTop: 10 }}>{headline.sub}</div>
        </div>

        <div style={{ background: T.cream, borderRadius: 16, padding: "26px 22px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>

          {/* ─── Demo mode (Supabase not configured) ─── */}
          {!supabaseOn && (
            <>
              <div style={{ background: "#fff8ec", border: `1px solid ${T.gold}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 11, color: "#7a5500", fontFamily: sans }}>
                ⚠ Demo mode — Supabase isn't configured. Sign-in only saves to local storage.
              </div>
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
                  onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border} />
              </div>
              {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
              <button onClick={handleLegacy} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Open My Calculators →
              </button>
            </>
          )}

          {/* ─── Sign In ─── */}
          {supabaseOn && mode === "signin" && (
            <>
              <Field label="Email Address *" value={email} onChange={setEmail} type="email" placeholder="jane@email.com" />
              <Field label="Password *" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
              {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
              {info && <div style={{ fontSize: 12, color: T.green, marginBottom: 10 }}>{info}</div>}
              <button onClick={handleSignIn} disabled={busy} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Signing in…" : "Sign In →"}
              </button>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12, color: T.muted }}>
                <LinkBtn onClick={() => switchMode("forgot")}>Forgot password?</LinkBtn>
                <span>New here? <LinkBtn onClick={() => switchMode("register")}>Create account</LinkBtn></span>
              </div>
            </>
          )}

          {/* ─── Register ─── */}
          {supabaseOn && mode === "register" && (
            <>
              <Field label="Full Name *" value={name} onChange={setName} type="text" placeholder="Jane Smith" />
              <Field label="Email Address *" value={email} onChange={setEmail} type="email" placeholder="jane@email.com" />
              <Field label="Password *" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters" />
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
                  onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border} />
              </div>
              {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
              {info && <div style={{ fontSize: 12, color: T.green, marginBottom: 10 }}>{info}</div>}
              <button onClick={handleRegister} disabled={busy} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Creating account…" : "Create Account →"}
              </button>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: T.muted }}>
                Already have an account? <LinkBtn onClick={() => switchMode("signin")}>Sign in</LinkBtn>
              </div>
            </>
          )}

          {/* ─── Forgot Password ─── */}
          {supabaseOn && mode === "forgot" && (
            <>
              <Field label="Email Address *" value={email} onChange={setEmail} type="email" placeholder="jane@email.com" />
              {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
              {info && <div style={{ fontSize: 12, color: T.green, marginBottom: 10 }}>{info}</div>}
              <button onClick={handleForgot} disabled={busy} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navy, border: "none", borderRadius: 10, fontFamily: sans, fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Sending…" : "Send Reset Link →"}
              </button>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: T.muted }}>
                <LinkBtn onClick={() => switchMode("signin")}>← Back to sign in</LinkBtn>
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: T.muted }}>Your info is shared securely with your agent.</div>
        </div>
      </div>
    </div>
  );
}
