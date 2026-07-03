# $ONBOARDING

> Onboard the next wave onto Solana. A directory of **developers** and
> **onboardees**, hands-on **guides**, and a transparent, on-chain
> **2% buyback-and-burn** on every on-platform tip.

A dark-mode-first, mobile-first site built with **React + Vite + Tailwind +
Framer Motion**, a **Supabase** backend (auth + Postgres + storage), **Solana
wallet-adapter** (Phantom, Solflare), and an **Anchor** program for the
fee → buyback → burn flow.

**Design language:** clean, friendly, light-first — white background, Sora /
Inter / JetBrains Mono (self-hosted via Fontsource, never falls back), the
Solana purple→green gradient as the hero accent, soft pastel blobs and
shadows, a live-activity hero card, boarding-pass path cards with
perforations and barcodes, a ticker marquee, and an interactive 98/2
fee-split calculator. Dark mode included as a toggle. Motion layer:
staggered blur-reveal headline, parallax hero blobs, scroll-drawn section
connector, spring-animated numbers, drifting CTA gradient, and soft route
transitions. Fully responsive, honest copy, `prefers-reduced-motion`
respected (all perpetual/large animations disabled).

---

## ⚠️ Read this first (honest flags)

- **The Anchor program is UNAUDITED.** It moves money. **Do not deploy to mainnet
  or route real funds until it is professionally audited.** The Jupiter swap in
  it is a documented *scaffold*, not a finished integration. See
  [`docs/SECURITY.md`](docs/SECURITY.md).
- **Not financial or legal advice.** Buyback-and-burn does **not** guarantee
  price or returns. Avoid promising returns; disclose paid promotion; get real
  legal/tax advice before launching a token.
- **Creator rewards** on Pump.fun go to the **launch wallet**, not automatically
  to a team. "Routing rewards to the onboarded person" means deciding who
  controls that wallet or setting up a split — see the guide
  `app/content/guides/routing-creator-rewards.md`.

## Assumptions I made (all reversible — tell me to change any)

I couldn't ask interactively in this session, so I picked sensible defaults:

1. **Scope:** full monorepo in one pass (frontend + Supabase + wallet + Anchor
   program + guides).
2. **Fee trigger:** a generic on-platform **tip/payment** primitive. Tipping is
   the concrete feature; 2% is skimmed → fee vault → buyback → burn. (Profile
   boosts can reuse the same primitive later.)
3. **Auth:** Supabase Auth (email magic-link, OAuth-ready) as the account layer +
   wallet-adapter for transactions, with the wallet linked to the profile.
4. **Guides:** real placeholder drafts for the three requested titles.

---

## Repo structure

```
.
├── app/                        # React + Vite + Tailwind front end
│   ├── content/guides/*.md     # Guides render from these Markdown files (drop new ones in)
│   ├── src/
│   │   ├── components/         # layout (Navbar/Footer/Theme) + UI primitives
│   │   ├── features/
│   │   │   ├── profiles/       # create/EDIT/delete flows, cards, profile page, data API
│   │   │   ├── directory/      # browsable/filterable/searchable directory
│   │   │   ├── guides/         # Markdown loader + sidebar + renderer
│   │   │   └── transactions/   # wallet button, tip modal, fee/burn builders
│   │   ├── lib/                # constants, types, supabase, solana provider, auth, fee math
│   │   └── pages/              # landing (hero + two-path chooser), 404
│   └── vite.config.ts
├── supabase/                   # schema.sql, policies.sql (RLS + storage), seed.sql, README
├── programs/onboarding_fee/    # Anchor program: collect_fee, swap (Jupiter), burn + tests
├── docs/SECURITY.md            # audit checklist / hard blockers before mainnet
├── .env.example                # every key you must paste (copy to .env)
└── README.md
```

---

## Quickstart (demo mode — no keys needed)

The app runs immediately with **local demo data** (profiles saved in your
browser, images as local previews) so you can see everything before wiring
backends.

```bash
npm install
cp .env.example .env      # optional in demo mode; leave REPLACE_ values as-is
npm run dev               # http://localhost:5173
```

What works in demo mode (all verified with scripted browser tests): landing +
two-path chooser, directory (search/filter), profile create/edit/delete (saved
to localStorage, edit gated to profiles created in your browser), profile
pages, guides with prev/next + reading progress, 404, light/dark theme, wallet
connect, and the SOL tip flow with fee preview (sending needs
`VITE_FEE_WALLET` + a wallet with devnet SOL).

Scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build (`app/dist`) |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `tsc --noEmit` on the app |
| `npm run anchor:build` | `anchor build` the program |
| `npm run anchor:test` | `anchor test` the program |

---

## Full setup

### 1. Supabase (auth + data + images)

Follow [`supabase/README.md`](supabase/README.md). In short:
1. Create a project at supabase.com.
2. Run `supabase/schema.sql`, then `policies.sql`, then (optional) `seed.sql` in
   the SQL editor.
3. Enable **Email** auth (magic link) and add your site URL to redirect URLs.
4. Paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `.env`.

### 2. Solana + env

- Set `VITE_SOLANA_NETWORK` and `VITE_SOLANA_RPC_URL` (use a paid RPC for prod).
- Set `VITE_ONBOARDING_MINT` to your $ONBOARDING SPL mint.
- Set `VITE_FEE_WALLET` (SOL fee destination) and `VITE_PLATFORM_FEE_BPS=200`.

### 3. Anchor program (fee → buyback → burn)

Prereqs: Rust, the Solana CLI, and Anchor (`avm install 0.30.1 && avm use 0.30.1`).

```bash
cd programs/onboarding_fee
anchor build
anchor keys sync          # writes the real program id into Anchor.toml + lib.rs
anchor test               # runs the local-validator tests (init, collect_fee, burn)
# Deploy when ready (devnet first!):
anchor deploy --provider.cluster devnet
```

Then paste the deployed program id into `VITE_FEE_PROGRAM_ID`.

**What the program does**
- `initialize(fee_bps)` — creates the config PDA, records the mint + fee (2%).
- `collect_fee(gross)` — enforces `fee = gross * 2%` on-chain, forwards the net
  to the recipient, accrues the fee in a vault PDA.
- `swap_fees_for_onboarding(jupiter_ix_data)` — **permissionless crank**; CPIs a
  Jupiter swap (SOL → $ONBOARDING) signed by the vault PDA. **Scaffold — needs
  the real Jupiter route + audit** (see `docs/SECURITY.md`).
- `burn_onboarding(amount)` — SPL-burns the bought-back $ONBOARDING forever.

**Token tips vs SOL tips (front end):** SOL tips send the 2% fee to the vault for
the buyback crank. `$ONBOARDING` tips **burn the 2% directly** (no swap needed) —
both paths are visible in a block explorer and previewed before you sign.

---

## 🔑 Values you must paste (every one)

| Where | Value | How to get it |
|---|---|---|
| `.env` → `VITE_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `.env` → `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | same page (anon key **only**) |
| `.env` → `VITE_SOLANA_RPC_URL` | RPC endpoint | Helius/Triton/QuickNode (or public devnet) |
| `.env` → `VITE_SOLANA_NETWORK` | Cluster | `mainnet-beta` / `devnet` / … |
| `.env` → `VITE_ONBOARDING_MINT` | $ONBOARDING SPL mint | your token's mint address |
| `.env` → `VITE_FEE_WALLET` | SOL fee destination | a wallet you control, or the vault PDA |
| `.env` → `VITE_FEE_PROGRAM_ID` | Deployed program id | `anchor keys list` after build |
| `.env` → `VITE_PLATFORM_FEE_BPS` | Fee in bps | `200` for 2% (keep in sync w/ program) |
| `Anchor.toml` (`[programs.*]`) | Program id | `anchor keys sync` |
| `programs/onboarding_fee/src/lib.rs` → `declare_id!` | Program id | `anchor keys sync` |
| Provider wallet (`~/.config/solana/id.json`) | Deployer keypair | **you provide** — never commit it |

### Things that need a real deployment/keypair from you
- A **funded deployer keypair** for `anchor deploy`.
- The **$ONBOARDING mint** (create it, e.g. via Pump.fun, then paste the mint).
- The **program id** after first build (`anchor keys sync`).
- A production **RPC URL** (public endpoints are rate-limited).
- The **Jupiter route wiring + audit** before any mainnet buyback.

---

## Guides

Guides render from Markdown in `app/content/guides/`. Drop in a new `.md` file
with frontmatter and it appears automatically in the sidebar and on the landing
page:

```md
---
title: My New Guide
description: One-line summary shown in the sidebar/cards.
order: 4
---

# My New Guide
Body in Markdown…
```

Included placeholders: *Setting up a Phantom Wallet*, *Launching on Pump.fun*,
*Routing creator rewards*.

## Deploy to Vercel

A root [`vercel.json`](vercel.json) already wires everything up (build command,
output dir `app/dist`, and the SPA rewrite so client-side routes work), so you
do **not** need to change Vercel's "Root Directory" — leave it at the repo root.

1. Push this repo to GitHub (done) and **Import Project** in Vercel, or use the CLI:
   ```bash
   npm i -g vercel
   vercel          # preview deploy
   vercel --prod   # production deploy
   ```
2. In **Vercel → Project → Settings → Environment Variables**, add the `VITE_*`
   vars from `.env.example` (Vite reads `VITE_`-prefixed vars straight from the
   build environment — no `.env` file needed on Vercel). At minimum set
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SOLANA_NETWORK`,
   `VITE_SOLANA_RPC_URL`; add the token/fee/program vars as you get them.
   Without any of these the site still deploys and runs in **demo mode**.
3. Redeploy after changing env vars.

Vercel picks these up from `vercel.json`:

| Setting | Value |
|---|---|
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `app/dist` |
| Rewrites | `/(.*)` → `/index.html` (SPA) |

> The same static build in `app/dist` also works on Netlify or Cloudflare Pages —
> replicate the build command, output dir, and SPA rewrite there.

## License

MIT (adjust as needed). Community project — nothing here is financial advice.
