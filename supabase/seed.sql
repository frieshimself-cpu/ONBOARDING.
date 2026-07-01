-- =============================================================================
-- Optional demo data. Run AFTER schema.sql + policies.sql.
-- These rows have user_id = null (no owner) so they're read-only in the UI.
-- =============================================================================
insert into public.profiles
  (user_type, handle, display_name, bio, skills, socials, portfolio_links, showcase, wallet_address)
values
  ('developer', 'solslinger', 'Ava Reyes',
   'Anchor + TypeScript dev. I ship Solana programs and clean React front-ends.',
   array['dev','design','product'],
   '{"x":"solslinger","github":"solslinger"}'::jsonb,
   '[{"label":"anchor-escrow","url":"https://github.com/example/anchor-escrow"}]'::jsonb,
   '[]'::jsonb, '7xKXtg2CW3s1e9wY1i6mR3n4pC8fQ2vH5uJ9bN0aZ1d'),
  ('onboardee', 'newcoiner', 'Sam Whitfield',
   'Just set up my first Phantom wallet. Looking for a dev to help me launch responsibly.',
   array['community','marketing'],
   '{"x":"newcoiner"}'::jsonb, '[]'::jsonb, '[]'::jsonb,
   'F5gH6jK7lM8nP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8jK')
on conflict (handle) do nothing;
