-- Authenticated CRM: link clients to auth.users and add an agents table.
-- Run after 001_clients.sql.

-- ─── 1. Link clients to auth.users ─────────────────────────────────────
alter table public.clients
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists clients_user_id_key
  on public.clients (user_id);

-- ─── 2. Agents table (admin allowlist) ────────────────────────────────
create table if not exists public.agents (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null unique,
  created_at timestamptz not null default now()
);

alter table public.agents enable row level security;

drop policy if exists "agents_self_select" on public.agents;
create policy "agents_self_select"
  on public.agents for select
  to authenticated
  using (auth.uid() = user_id);

-- ─── 3. Tighten clients RLS now that auth is in play ──────────────────
-- Drop the open anon policies from 001_clients.sql.
drop policy if exists "clients_anon_insert" on public.clients;
drop policy if exists "clients_anon_select" on public.clients;
drop policy if exists "clients_anon_update" on public.clients;

-- A user can read their own client row OR any row if they are an agent.
drop policy if exists "clients_self_or_agent_select" on public.clients;
create policy "clients_self_or_agent_select"
  on public.clients for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.agents where user_id = auth.uid())
  );

-- A user can insert a client row only for themselves.
drop policy if exists "clients_self_insert" on public.clients;
create policy "clients_self_insert"
  on public.clients for insert
  to authenticated
  with check (auth.uid() = user_id);

-- A user can update their own row; agents can update any.
drop policy if exists "clients_self_or_agent_update" on public.clients;
create policy "clients_self_or_agent_update"
  on public.clients for update
  to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.agents where user_id = auth.uid())
  )
  with check (
    auth.uid() = user_id
    or exists (select 1 from public.agents where user_id = auth.uid())
  );

-- ─── 4. Seeding an agent ──────────────────────────────────────────────
-- After creating an account through the /admin login screen (or via the
-- Supabase dashboard → Authentication → Users), grant agent access by
-- running:
--
--   insert into public.agents (user_id, email)
--   values ('<auth.users.id>', 'agent@example.com');
