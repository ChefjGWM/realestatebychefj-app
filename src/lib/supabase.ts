import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = (): boolean => supabase !== null;

// ─── Client shape ──────────────────────────────────────────────────────
// DB columns: id, name, email, phone, budget, preapproved, notes,
//             dti_data, budget_data, created_at, updated_at
// In-app shape uses: dti, budget_data, createdAt, updatedAt
// Helpers below translate between the two.

export type ClientRow = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  budget?: number | string | null;
  preapproved?: string | null;
  notes?: string | null;
  dti_data?: any;
  budget_data?: any;
  created_at?: string;
  updated_at?: string;
};

export type AppClient = {
  name: string;
  email: string;
  phone?: string;
  budget?: number | string;
  preapproved?: string;
  notes?: string;
  dti?: any;
  budget_data?: any;
  createdAt?: string;
  updatedAt?: string;
};

// DB row → in-app client shape
export function rowToClient(r: ClientRow): AppClient {
  return {
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    budget: r.budget ?? "",
    preapproved: r.preapproved ?? "no",
    notes: r.notes ?? "",
    dti: r.dti_data ?? undefined,
    budget_data: r.budget_data ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Upsert (insert or merge) a client profile by email.
// Returns the resulting in-app client object, or null if Supabase is unconfigured.
export async function upsertClient(profile: AppClient): Promise<AppClient | null> {
  if (!supabase) return null;
  const budget =
    profile.budget === "" || profile.budget == null
      ? null
      : Number(profile.budget);
  const payload: ClientRow = {
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? null,
    budget,
    preapproved: profile.preapproved ?? null,
    notes: profile.notes ?? null,
  };
  const { data, error } = await supabase
    .from("clients")
    .upsert(payload, { onConflict: "email" })
    .select()
    .single();
  if (error) throw error;
  return rowToClient(data as ClientRow);
}

// Update the DTI or Budget section on an existing client row.
// `section` is the in-app key ("dti" or "budget_data").
export async function updateClientSection(
  email: string,
  section: "dti" | "budget_data",
  data: any,
): Promise<void> {
  if (!supabase) return;
  const column = section === "dti" ? "dti_data" : "budget_data";
  const { error } = await supabase
    .from("clients")
    .update({ [column]: data })
    .eq("email", email);
  if (error) throw error;
}

// List all clients, newest updates first.
export async function listClients(): Promise<AppClient[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToClient);
}

// ─── Auth helpers ──────────────────────────────────────────────────────

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  budget?: string | number;
  preapproved?: string;
  notes?: string;
};

// Sign up a new client. Creates the auth user and (if a session is returned)
// the corresponding row in the clients table. If email-confirmation is
// enabled in Supabase, no session is returned and the row will be created
// lazily on first sign-in via the user_metadata stash.
export async function signUpClient(input: RegisterInput): Promise<AppClient | null> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        phone: input.phone ?? "",
        budget: input.budget ?? "",
        preapproved: input.preapproved ?? "no",
        notes: input.notes ?? "",
      },
    },
  });
  if (error) throw error;
  if (!data.user) return null;
  // If a session exists (email confirmation is OFF), create the client row now.
  if (data.session) {
    return await ensureClientRow(data.user.id, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      budget: input.budget,
      preapproved: input.preapproved,
      notes: input.notes,
    });
  }
  return null;
}

// Sign in an existing client. Loads (and lazily creates) their client row.
export async function signInClient(
  email: string,
  password: string,
): Promise<AppClient> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("No user returned from sign in");
  // Try to load existing row.
  const existing = await loadClientByUserId(data.user.id);
  if (existing) return existing;
  // Lazy create from user_metadata stash (registered with confirmation on).
  const md = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  return await ensureClientRow(data.user.id, {
    name: (md.name as string) || data.user.email || "",
    email: data.user.email!,
    phone: md.phone as string,
    budget: md.budget as string,
    preapproved: md.preapproved as string,
    notes: md.notes as string,
  });
}

// Restore session and load the current client (if any).
export async function getCurrentClient(): Promise<AppClient | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return await loadClientByUserId(session.user.id);
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Sign in an agent: signs in via auth, then verifies the user exists in the
// agents table. Throws "Not authorized" if not.
export async function signInAgent(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("No user returned from sign in");
  const ok = await isCurrentUserAgent();
  if (!ok) {
    await supabase.auth.signOut();
    throw new Error("Not authorized — this account is not an agent.");
  }
}

// Check if the currently signed-in user is in the agents table.
export async function isCurrentUserAgent(): Promise<boolean> {
  if (!supabase) return false;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;
  const { data, error } = await supabase
    .from("agents")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// Sign out the current user (client or agent).
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Send a password reset email. The user is redirected back to the app root.
export async function sendPasswordReset(email: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");
  const redirectTo =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

// ─── Internal helpers ─────────────────────────────────────────────────

async function loadClientByUserId(userId: string): Promise<AppClient | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return data ? rowToClient(data as ClientRow) : null;
}

async function ensureClientRow(
  userId: string,
  profile: Omit<AppClient, "createdAt" | "updatedAt">,
): Promise<AppClient> {
  if (!supabase) throw new Error("Supabase is not configured");
  const budget =
    profile.budget === "" || profile.budget == null ? null : Number(profile.budget);
  const payload = {
    user_id: userId,
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? null,
    budget,
    preapproved: profile.preapproved ?? null,
    notes: profile.notes ?? null,
  };
  const { data, error } = await supabase
    .from("clients")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return rowToClient(data as ClientRow);
}
