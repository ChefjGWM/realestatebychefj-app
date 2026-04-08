-- Clients table for the Real Estate by Chef J CRM.
-- Run this against your Supabase project (SQL editor) or via `supabase db push`.

create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null unique,
  phone        text,
  budget       numeric,
  preapproved  text,
  notes        text,
  dti_data     jsonb,
  budget_data  jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists clients_updated_at_idx
  on public.clients (updated_at desc);

-- Automatically bump updated_at on any UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────
-- The current app is client-side only and uses the anon key, so the policies
-- below allow anonymous insert/select/update on the clients table. This is
-- suitable for a prototype or invite-only deployment. For production you
-- should add Supabase Auth and restrict by auth.uid() / agent role.
alter table public.clients enable row level security;

drop policy if exists "clients_anon_insert" on public.clients;
create policy "clients_anon_insert"
  on public.clients for insert
  to anon, authenticated
  with check (true);

drop policy if exists "clients_anon_select" on public.clients;
create policy "clients_anon_select"
  on public.clients for select
  to anon, authenticated
  using (true);

drop policy if exists "clients_anon_update" on public.clients;
create policy "clients_anon_update"
  on public.clients for update
  to anon, authenticated
  using (true)
  with check (true);
