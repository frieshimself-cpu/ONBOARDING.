-- =============================================================================
-- $ONBOARDING — database schema
-- Run this first in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Then run policies.sql, then (optionally) seed.sql.
-- =============================================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  user_type      text not null check (user_type in ('developer', 'onboardee')),
  handle         text not null unique,
  display_name   text not null,
  bio            text,
  avatar_url     text,
  wallet_address text,
  skills         text[] not null default '{}',
  portfolio_links jsonb not null default '[]'::jsonb,
  socials        jsonb not null default '{}'::jsonb,
  showcase       jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists profiles_user_type_idx on public.profiles (user_type);
create index if not exists profiles_skills_idx on public.profiles using gin (skills);
create index if not exists profiles_handle_idx on public.profiles (handle);

-- ----------------------------------------------------------------------------
-- tips  (off-chain audit log — the on-chain transaction is the source of truth)
-- ----------------------------------------------------------------------------
create table if not exists public.tips (
  id             uuid primary key default gen_random_uuid(),
  from_wallet    text not null,
  to_profile_id  uuid references public.profiles (id) on delete set null,
  to_wallet      text not null,
  token          text not null check (token in ('SOL', 'ONBOARDING')),
  gross_lamports bigint not null,
  fee_lamports   bigint not null,
  net_lamports   bigint not null,
  fee_bps        int not null,
  message        text,
  signature      text unique,
  status         text not null default 'confirmed',
  created_at     timestamptz not null default now()
);

create index if not exists tips_to_profile_idx on public.tips (to_profile_id);

-- ----------------------------------------------------------------------------
-- keep updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
