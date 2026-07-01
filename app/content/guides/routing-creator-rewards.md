---
title: Routing creator rewards
description: Who actually receives Pump.fun creator rewards, and how to split them fairly with the people who helped.
order: 3
---

# Routing creator rewards

This is the guide people skip and regret. **Creator rewards on Pump.fun go to the
wallet that launched the coin** — not to "the project", not automatically to a
team. If you want to reward the person you onboarded (or the dev, artist, or
marketer who helped), you have to *decide that on purpose.*

> **The core fact:** rewards follow the **launch wallet**. Control of that wallet
> is control of the rewards. Everything below is about handling that fact fairly
> and transparently.

## Your options, honestly

### Option A — One trusted person controls the launch wallet
Simplest. The launcher receives all creator rewards and pays others manually.

- ✅ Easy to set up.
- ⚠️ Requires **trust** — the launcher *can* keep everything. Put terms in writing.

### Option B — A shared/multisig launch wallet
Use a Solana multisig (e.g. **[Squads](https://squads.so)**) as the launch wallet
so rewards land in an account **no single person** can drain.

- ✅ No single point of trust; withdrawals need M-of-N approval.
- ⚠️ More setup; decide signers and threshold up front.

### Option C — Route rewards, then split
Send creator rewards to a wallet whose job is to **split** — either manually on a
schedule, or with a payments/streaming tool (e.g. **Streamflow**) that pays each
contributor a fixed percentage.

- ✅ Clear, ongoing, auditable splits.
- ⚠️ You still control the source wallet; automate and document it.

## A simple, fair default

1. Agree on **who gets what %** *before* launch (e.g. dev 40 / art 20 / marketing
   20 / launcher 20). Write it down where contributors can see it.
2. Launch from a **Squads multisig** with those people as signers.
3. Pay out on a **regular cadence** (e.g. weekly) from the multisig, or stream
   continuously with Streamflow.
4. **Publish the addresses.** Transparency is the whole point — link the multisig
   and the split so anyone can verify.

## How this connects to $ONBOARDING

On this platform, **tips** are the lightweight version of the same idea: when
someone tips a contributor, the recipient gets **98%** and **2%** is routed to a
program-controlled fee vault that **market-buys $ONBOARDING and burns it**. It's
the same principle — value flows to the people doing the work, transparently and
on-chain.

For real creator-reward splits from your own coin, use a multisig or streaming
setup as above. This guide is a starting point, **not legal or tax advice** —
reward splits can have tax and regulatory implications; get proper advice for
anything sizable.

---

Back to **[all guides](/guides)**.
