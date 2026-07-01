# Supabase setup

This app talks to Supabase for **auth**, **profile data (Postgres)**, and
**image storage**. It runs in *demo mode* (local browser data) until you add the
two `VITE_SUPABASE_*` env vars.

## 1. Create a project
1. Go to <https://supabase.com> → **New project**.
2. Note your **Project URL** and **anon public key** (Project Settings → API).

## 2. Run the SQL (in order)
Open **SQL Editor** in the dashboard and run each file:
1. `schema.sql` — tables, indexes, triggers
2. `policies.sql` — Row Level Security + storage buckets/policies
3. `seed.sql` — *(optional)* a couple of demo profiles

## 3. Enable auth
- **Authentication → Providers → Email**: enable it. This app uses **magic-link
  OTP** by default (`signInWithOtp`). You can also enable OAuth providers
  (GitHub, Google) — the UI will pick them up with minor changes.
- Add your site URL to **Authentication → URL Configuration → Redirect URLs**
  (e.g. `http://localhost:5173` and your production domain).

## 4. Paste keys into the app
In `app/.env` (copy from the repo root `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Restart `npm run dev`. The app now persists profiles/images and uses real auth.

## Security notes
- Only the **anon** key belongs in the front end. **Never** ship the
  `service_role` key in client code.
- The `tips` table allows anonymous inserts (it's a convenience audit log). If
  you want it trustworthy, verify the tx signature on-chain in a Supabase Edge
  Function before inserting, and tighten the policy.
- RLS is ON for both tables — profiles can only be edited by their owner.
