import { NextResponse } from "next/server";
import { Resend } from "resend";

const RECIPIENT = "fjj_myhome@outlook.com";

type RegisterPayload = {
  type: "register";
  client: {
    name: string;
    email: string;
    phone?: string;
    budget?: string | number;
    preapproved?: string;
    notes?: string;
  };
};

type DTIPayload = {
  type: "dti";
  client: { name: string; email: string };
  data: {
    income?: number | string;
    frontDTI?: string | number;
    backDTI?: string | number;
  };
};

type BudgetPayload = {
  type: "budget";
  client: { name: string; email: string };
  data: {
    housing?: number;
    leftover?: number;
    housingPct?: string | number;
    totalExpenses?: number;
  };
};

type Payload = RegisterPayload | DTIPayload | BudgetPayload;

const fmtCurrency = (n: unknown): string => {
  const num = typeof n === "number" ? n : parseFloat(String(n ?? ""));
  if (!isFinite(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};

const escape = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const preApprovedLabel = (v?: string) => {
  if (v === "yes") return "✓ Pre-Approved";
  if (v === "inprogress") return "In Progress";
  if (v === "no") return "Not Yet";
  return v ?? "—";
};

function buildEmail(payload: Payload): { subject: string; html: string; text: string } {
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  if (payload.type === "register") {
    const c = payload.client;
    const subject = `New Client: ${c.name} signed up`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="color:#0b1f3a;border-bottom:2px solid #c9a052;padding-bottom:8px">
          New Client Registration
        </h2>
        <p style="color:#6b7a99;font-size:13px">${escape(now)}</p>
        <table cellpadding="6" style="font-size:14px;border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${escape(c.name)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escape(c.email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${escape(c.phone || "—")}</td></tr>
          <tr><td><strong>Budget</strong></td><td>${escape(c.budget ? fmtCurrency(c.budget) : "—")}</td></tr>
          <tr><td><strong>Pre-Approval</strong></td><td>${escape(preApprovedLabel(c.preapproved))}</td></tr>
          <tr><td><strong>Notes</strong></td><td>${escape(c.notes || "—")}</td></tr>
        </table>
        <p style="color:#6b7a99;font-size:11px;margin-top:24px">
          Real Estate by Chef J — Client Toolkit
        </p>
      </div>
    `;
    const text = [
      `New Client Registration — ${now}`,
      ``,
      `Name: ${c.name}`,
      `Email: ${c.email}`,
      `Phone: ${c.phone || "—"}`,
      `Budget: ${c.budget ? fmtCurrency(c.budget) : "—"}`,
      `Pre-Approval: ${preApprovedLabel(c.preapproved)}`,
      `Notes: ${c.notes || "—"}`,
    ].join("\n");
    return { subject, html, text };
  }

  if (payload.type === "dti") {
    const { client, data } = payload;
    const subject = `Client ${client.name} updated their financial info`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="color:#0b1f3a;border-bottom:2px solid #c9a052;padding-bottom:8px">
          Client Updated DTI
        </h2>
        <p style="color:#6b7a99;font-size:13px">${escape(now)}</p>
        <p><strong>${escape(client.name)}</strong> &lt;${escape(client.email)}&gt;</p>
        <table cellpadding="6" style="font-size:14px;border-collapse:collapse">
          <tr><td><strong>Front-End DTI</strong></td><td>${escape(data.frontDTI ?? "—")}%</td></tr>
          <tr><td><strong>Back-End DTI</strong></td><td>${escape(data.backDTI ?? "—")}%</td></tr>
          <tr><td><strong>Gross Monthly Income</strong></td><td>${escape(fmtCurrency(data.income))}</td></tr>
        </table>
        <p style="color:#6b7a99;font-size:11px;margin-top:24px">
          Real Estate by Chef J — Client Toolkit
        </p>
      </div>
    `;
    const text = [
      `Client Updated DTI — ${now}`,
      ``,
      `${client.name} <${client.email}>`,
      `Front-End DTI: ${data.frontDTI ?? "—"}%`,
      `Back-End DTI: ${data.backDTI ?? "—"}%`,
      `Income: ${fmtCurrency(data.income)}`,
    ].join("\n");
    return { subject, html, text };
  }

  // budget
  const { client, data } = payload;
  const subject = `Client ${client.name} updated their financial info`;
  const surplusLabel = (data.leftover ?? 0) >= 0 ? "Monthly Surplus" : "Monthly Shortfall";
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#0b1f3a;border-bottom:2px solid #c9a052;padding-bottom:8px">
        Client Updated Budget
      </h2>
      <p style="color:#6b7a99;font-size:13px">${escape(now)}</p>
      <p><strong>${escape(client.name)}</strong> &lt;${escape(client.email)}&gt;</p>
      <table cellpadding="6" style="font-size:14px;border-collapse:collapse">
        <tr><td><strong>Housing Cost</strong></td><td>${escape(fmtCurrency(data.housing))}/mo</td></tr>
        <tr><td><strong>Total Expenses</strong></td><td>${escape(fmtCurrency(data.totalExpenses))}/mo</td></tr>
        <tr><td><strong>${escape(surplusLabel)}</strong></td><td>${escape(fmtCurrency(Math.abs(data.leftover ?? 0)))}/mo</td></tr>
        <tr><td><strong>Housing Ratio</strong></td><td>${escape(data.housingPct ?? "—")}%</td></tr>
      </table>
      <p style="color:#6b7a99;font-size:11px;margin-top:24px">
        Real Estate by Chef J — Client Toolkit
      </p>
    </div>
  `;
  const text = [
    `Client Updated Budget — ${now}`,
    ``,
    `${client.name} <${client.email}>`,
    `Housing: ${fmtCurrency(data.housing)}/mo`,
    `Total Expenses: ${fmtCurrency(data.totalExpenses)}/mo`,
    `${surplusLabel}: ${fmtCurrency(Math.abs(data.leftover ?? 0))}/mo`,
    `Housing Ratio: ${data.housingPct ?? "—"}%`,
  ].join("\n");
  return { subject, html, text };
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || !payload.type || !["register", "dti", "budget"].includes(payload.type)) {
    return NextResponse.json({ ok: false, error: "Missing or invalid type" }, { status: 400 });
  }

  const { subject, html, text } = buildEmail(payload);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  // Graceful fallback: if Resend isn't configured, log to the server console
  // and return success so the client UX is unaffected. The full email body
  // contains client PII (name, email), so only print it in development;
  // production logs just record that the path was hit, not the contents.
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[notify] Resend not configured — would have sent:");
      console.log(`  to:      ${RECIPIENT}`);
      console.log(`  subject: ${subject}`);
      console.log(`  body:\n${text}`);
    } else {
      console.warn("[notify] Resend not configured — notification skipped");
    }
    return NextResponse.json({ ok: true, sent: false, reason: "resend-not-configured" });
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: RECIPIENT,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[notify] Resend error:", error);
      return NextResponse.json({ ok: false, sent: false, error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sent: true, id: data?.id });
  } catch (e) {
    console.error("[notify] Resend threw:", e);
    return NextResponse.json(
      { ok: false, sent: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 502 },
    );
  }
}
