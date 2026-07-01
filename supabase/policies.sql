-- =============================================================================
-- Row Level Security + Storage. Run AFTER schema.sql.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.tips enable row level security;

-- ---- profiles ----
-- Anyone can read the directory.
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select using (true);

-- A signed-in user may create their own profile (user_id must be themselves).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (user_id = auth.uid());

-- ...and edit / delete only their own.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete to authenticated
  using (user_id = auth.uid());

-- ---- tips (audit log) ----
-- Public read; inserts allowed (client records a tip after a confirmed tx).
-- NOTE: this is a low-value audit table; consider an Edge Function that verifies
-- the signature on-chain before inserting if you want to harden it.
drop policy if exists "tips_public_read" on public.tips;
create policy "tips_public_read"
  on public.tips for select using (true);

drop policy if exists "tips_insert_any" on public.tips;
create policy "tips_insert_any"
  on public.tips for insert with check (true);

-- =============================================================================
-- Storage buckets for images
-- =============================================================================
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('showcase', 'showcase', true)
  on conflict (id) do nothing;

-- Public read of images.
drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read"
  on storage.objects for select
  using (bucket_id in ('avatars', 'showcase'));

-- Signed-in users can upload.
drop policy if exists "images_auth_upload" on storage.objects;
create policy "images_auth_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'showcase'));
