//! # onboarding_fee
//!
//! On-chain fee-collection + buyback-and-burn for **$ONBOARDING**.
//!
//! Flow:
//!   1. `collect_fee`  — take a 2% fee from an on-platform tip, forward the net
//!                        to the recipient, and accrue the fee in a vault PDA.
//!   2. `swap_fees_for_onboarding` — permissionless crank: swap accrued SOL for
//!                        $ONBOARDING via a **Jupiter** CPI.
//!   3. `burn_onboarding` — burn the acquired $ONBOARDING (SPL burn) forever.
//!
//! ─────────────────────────────────────────────────────────────────────────
//! ⚠️  UNAUDITED. This moves money. DO NOT deploy to mainnet without a
//!     professional audit. The Jupiter CPI in `swap_fees_for_onboarding` is a
//!     documented scaffold — it needs the real Jupiter program id, route
//!     accounts, and WSOL wrapping wired in. See README "Anchor program".
//! ─────────────────────────────────────────────────────────────────────────

use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::{AccountMeta, Instruction};
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{burn, Burn, Mint, Token, TokenAccount};

// REPLACE after `anchor build` + `anchor keys sync`.
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub const FEE_CONFIG_SEED: &[u8] = b"fee_config";
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";

/// Safety cap so the authority can never set a predatory fee. 500 bps = 5%.
pub const MAX_FEE_BPS: u16 = 500;

#[program]
pub mod onboarding_fee {
    use super::*;

    /// One-time setup. Creates the config PDA and records the $ONBOARDING mint
    /// and the fee (in basis points; 200 = 2%).
    pub fn initialize(ctx: Context<Initialize>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= MAX_FEE_BPS, FeeError::FeeTooHigh);
        let cfg = &mut ctx.accounts.fee_config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.onboarding_mint = ctx.accounts.onboarding_mint.key();
        cfg.fee_bps = fee_bps;
        cfg.total_fees_collected = 0;
        cfg.total_burned = 0;
        cfg.vault_bump = ctx.bumps.fee_vault;
        cfg.bump = ctx.bumps.fee_config;
        Ok(())
    }

    /// Collect the platform fee on a tip and forward the rest to the recipient.
    /// Fee math is enforced ON-CHAIN: `fee = gross * fee_bps / 10_000`.
    pub fn collect_fee(ctx: Context<CollectFee>, gross_lamports: u64) -> Result<()> {
        let fee_bps = ctx.accounts.fee_config.fee_bps as u128;
        let fee = (gross_lamports as u128)
            .checked_mul(fee_bps)
            .and_then(|v| v.checked_div(10_000))
            .ok_or(FeeError::MathOverflow)? as u64;
        let net = gross_lamports.checked_sub(fee).ok_or(FeeError::MathOverflow)?;

        // net -> recipient
        if net > 0 {
            transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.payer.to_account_info(),
                        to: ctx.accounts.recipient.to_account_info(),
                    },
                ),
                net,
            )?;
        }

        // fee -> vault PDA
        if fee > 0 {
            transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.payer.to_account_info(),
                        to: ctx.accounts.fee_vault.to_account_info(),
                    },
                ),
                fee,
            )?;
        }

        let cfg = &mut ctx.accounts.fee_config;
        cfg.total_fees_collected = cfg.total_fees_collected.checked_add(fee).unwrap();

        emit!(FeeCollected {
            payer: ctx.accounts.payer.key(),
            recipient: ctx.accounts.recipient.key(),
            gross: gross_lamports,
            fee,
            net,
        });
        Ok(())
    }

    /// BUYBACK (swap) — permissionless crank.
    ///
    /// Executes a Jupiter swap (SOL -> $ONBOARDING) via CPI, **signed by the fee
    /// vault PDA**. The route and instruction data are built OFF-CHAIN with the
    /// Jupiter API (`GET /swap-instructions`) and passed in as `jupiter_ix_data`;
    /// every account the route touches must be supplied in `remaining_accounts`
    /// (including the Jupiter program itself).
    ///
    /// ⚠️ SCAFFOLD: you must (a) pass the canonical Jupiter aggregator program id,
    /// (b) wrap the vault SOL to WSOL as part of the route, and (c) have this
    /// audited. See README.
    pub fn swap_fees_for_onboarding(
        ctx: Context<SwapFees>,
        jupiter_ix_data: Vec<u8>,
    ) -> Result<()> {
        require!(!jupiter_ix_data.is_empty(), FeeError::EmptyRoute);

        let metas: Vec<AccountMeta> = ctx
            .remaining_accounts
            .iter()
            .map(|acc| AccountMeta {
                pubkey: *acc.key,
                is_signer: acc.is_signer,
                is_writable: acc.is_writable,
            })
            .collect();

        let ix = Instruction {
            program_id: ctx.accounts.jupiter_program.key(),
            accounts: metas,
            data: jupiter_ix_data,
        };

        let vault_bump = ctx.accounts.fee_config.vault_bump;
        let vault_seeds: &[&[u8]] = &[FEE_VAULT_SEED, core::slice::from_ref(&vault_bump)];

        // Include the jupiter program account info so the runtime can resolve it.
        let mut infos = ctx.remaining_accounts.to_vec();
        infos.push(ctx.accounts.jupiter_program.to_account_info());

        invoke_signed(&ix, &infos, &[vault_seeds])?;

        emit!(SwapRouted {
            cranker: ctx.accounts.cranker.key(),
        });
        Ok(())
    }

    /// BURN — destroy the program-held $ONBOARDING via SPL `burn`, permanently
    /// reducing supply. Signed by the config PDA (the token account authority).
    pub fn burn_onboarding(ctx: Context<BurnOnboarding>, amount: u64) -> Result<()> {
        let bump = ctx.accounts.fee_config.bump;
        let signer_seeds: &[&[u8]] = &[FEE_CONFIG_SEED, core::slice::from_ref(&bump)];

        burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.onboarding_mint.to_account_info(),
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.fee_config.to_account_info(),
                },
                &[signer_seeds],
            ),
            amount,
        )?;

        let cfg = &mut ctx.accounts.fee_config;
        cfg.total_burned = cfg.total_burned.checked_add(amount).unwrap();

        emit!(Burned {
            amount,
            total_burned: cfg.total_burned,
        });
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + FeeConfig::SIZE,
        seeds = [FEE_CONFIG_SEED],
        bump
    )]
    pub fee_config: Account<'info, FeeConfig>,

    /// SOL-only vault PDA (a plain system account). Exists once it holds lamports.
    #[account(seeds = [FEE_VAULT_SEED], bump)]
    pub fee_vault: SystemAccount<'info>,

    pub onboarding_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: recipient of the net tip; can be any address.
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    #[account(mut, seeds = [FEE_VAULT_SEED], bump = fee_config.vault_bump)]
    pub fee_vault: SystemAccount<'info>,

    #[account(mut, seeds = [FEE_CONFIG_SEED], bump = fee_config.bump)]
    pub fee_config: Account<'info, FeeConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapFees<'info> {
    /// Anyone can crank the buyback.
    pub cranker: Signer<'info>,

    #[account(mut, seeds = [FEE_VAULT_SEED], bump = fee_config.vault_bump)]
    pub fee_vault: SystemAccount<'info>,

    #[account(seeds = [FEE_CONFIG_SEED], bump = fee_config.bump)]
    pub fee_config: Account<'info, FeeConfig>,

    /// CHECK: The Jupiter aggregator program. Verify you pass the canonical id.
    pub jupiter_program: UncheckedAccount<'info>,
    // remaining_accounts: every account the Jupiter route references.
}

#[derive(Accounts)]
pub struct BurnOnboarding<'info> {
    /// Anyone can crank the burn.
    pub cranker: Signer<'info>,

    #[account(mut, seeds = [FEE_CONFIG_SEED], bump = fee_config.bump)]
    pub fee_config: Account<'info, FeeConfig>,

    #[account(mut, address = fee_config.onboarding_mint)]
    pub onboarding_mint: Account<'info, Mint>,

    /// Program-owned token account holding the bought-back $ONBOARDING.
    #[account(
        mut,
        token::mint = onboarding_mint,
        token::authority = fee_config
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ---------------------------------------------------------------------------
// State / events / errors
// ---------------------------------------------------------------------------

#[account]
pub struct FeeConfig {
    pub authority: Pubkey,
    pub onboarding_mint: Pubkey,
    pub fee_bps: u16,
    pub total_fees_collected: u64,
    pub total_burned: u64,
    pub vault_bump: u8,
    pub bump: u8,
}
impl FeeConfig {
    pub const SIZE: usize = 32 + 32 + 2 + 8 + 8 + 1 + 1;
}

#[event]
pub struct FeeCollected {
    pub payer: Pubkey,
    pub recipient: Pubkey,
    pub gross: u64,
    pub fee: u64,
    pub net: u64,
}

#[event]
pub struct SwapRouted {
    pub cranker: Pubkey,
}

#[event]
pub struct Burned {
    pub amount: u64,
    pub total_burned: u64,
}

#[error_code]
pub enum FeeError {
    #[msg("Fee exceeds the maximum allowed (5%).")]
    FeeTooHigh,
    #[msg("Arithmetic overflow.")]
    MathOverflow,
    #[msg("Empty Jupiter route data.")]
    EmptyRoute,
}
