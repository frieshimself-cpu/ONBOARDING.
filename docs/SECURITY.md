# Security & audit checklist

This project moves money on Solana. **The Anchor program is UNAUDITED. Do not
deploy it to mainnet or route real funds through it until every item below is
resolved and a professional audit is complete.**

## Before mainnet — hard blockers
- [ ] **Professional audit** of `programs/onboarding_fee` by a reputable Solana
      auditor (e.g. OtterSec, Neodyme, Zellic, Sec3).
- [ ] **Jupiter CPI hardening.** `swap_fees_for_onboarding` is a documented
      scaffold. It must:
  - [ ] Pin/verify the canonical Jupiter aggregator program id.
  - [ ] Validate the swap **output mint == `fee_config.onboarding_mint`** and a
        **minimum out amount** (slippage bound) so the crank can't be sandwiched
        into buying dust.
  - [ ] Handle **WSOL wrap/unwrap** for the vault SOL correctly and close temp
        accounts.
  - [ ] Constrain which accounts the CPI may touch (don't blindly forward
        arbitrary `remaining_accounts` with a PDA signer — this is the highest
        risk in the whole program).
- [ ] **Authority model.** Decide who can call `initialize`/change config, and
      whether it should be a multisig (Squads). Consider making config immutable.
- [ ] **Reentrancy / arithmetic.** `overflow-checks = true` is on; re-review all
      math and CPI ordering during audit.

## Keys & secrets
- [ ] Never commit keypairs (`*-keypair.json`, `id.json` are gitignored).
- [ ] Only the Supabase **anon** key is in the front end. Keep `service_role`
      server-side only.
- [ ] Use a dedicated deployer keypair; fund minimally.

## Front-end / product
- [ ] Every transaction shows a preview with amounts + recipient before signing
      (implemented in `TipModal`). Keep it that way.
- [ ] The app is **non-custodial** — never request or store private keys/seed
      phrases. Guides repeat this to users.

## Legal / compliance (not legal advice)
- [ ] Avoid promising price/returns. Buyback-and-burn ≠ guaranteed value.
- [ ] Disclose any paid promotion. Undisclosed shilling draws enforcement.
- [ ] Get proper legal/tax advice before launching a token or routing rewards.
