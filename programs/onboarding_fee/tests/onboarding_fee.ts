import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from '@solana/web3.js'
import {
  createMint,
  mintTo,
  getMint,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { assert } from 'chai'

describe('onboarding_fee', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace.OnboardingFee as Program<any>
  const wallet = provider.wallet as anchor.Wallet

  const [feeConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('fee_config')],
    program.programId,
  )
  const [feeVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('fee_vault')],
    program.programId,
  )

  let onboardingMint: PublicKey
  let vaultTokenAccount: PublicKey

  const FEE_BPS = 200 // 2%

  before(async () => {
    // Create a stand-in $ONBOARDING mint (6 decimals), authority = test wallet.
    onboardingMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      6,
    )
    vaultTokenAccount = getAssociatedTokenAddressSync(
      onboardingMint,
      feeConfig,
      true, // allowOwnerOffCurve (PDA owner)
    )
  })

  it('initializes the fee config', async () => {
    await program.methods
      .initialize(FEE_BPS)
      .accounts({
        authority: wallet.publicKey,
        feeConfig,
        feeVault,
        onboardingMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    const cfg = await program.account.feeConfig.fetch(feeConfig)
    assert.equal(cfg.feeBps, FEE_BPS)
    assert.equal(cfg.onboardingMint.toBase58(), onboardingMint.toBase58())
    assert.equal(cfg.totalFeesCollected.toNumber(), 0)
  })

  it('collects a 2% fee and forwards the net to the recipient', async () => {
    const recipient = Keypair.generate()
    const gross = 0.1 * LAMPORTS_PER_SOL // 100_000_000
    const expectedFee = Math.floor((gross * FEE_BPS) / 10_000) // 2_000_000
    const expectedNet = gross - expectedFee

    const vaultBefore = await provider.connection.getBalance(feeVault)

    await program.methods
      .collectFee(new anchor.BN(gross))
      .accounts({
        payer: wallet.publicKey,
        recipient: recipient.publicKey,
        feeVault,
        feeConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    const vaultAfter = await provider.connection.getBalance(feeVault)
    const recipientBal = await provider.connection.getBalance(recipient.publicKey)

    assert.equal(vaultAfter - vaultBefore, expectedFee, 'vault should hold the fee')
    assert.equal(recipientBal, expectedNet, 'recipient should get the net')

    const cfg = await program.account.feeConfig.fetch(feeConfig)
    assert.equal(cfg.totalFeesCollected.toNumber(), expectedFee)
  })

  it('burns program-held $ONBOARDING', async () => {
    // Create the program-owned token account and fund it.
    const ataIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      vaultTokenAccount,
      feeConfig,
      onboardingMint,
    )
    await provider.sendAndConfirm(new anchor.web3.Transaction().add(ataIx))

    const minted = 1_000_000
    await mintTo(
      provider.connection,
      wallet.payer,
      onboardingMint,
      vaultTokenAccount,
      wallet.publicKey,
      minted,
    )

    const supplyBefore = (await getMint(provider.connection, onboardingMint)).supply
    const burnAmount = 400_000

    await program.methods
      .burnOnboarding(new anchor.BN(burnAmount))
      .accounts({
        cranker: wallet.publicKey,
        feeConfig,
        onboardingMint,
        vaultTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    const supplyAfter = (await getMint(provider.connection, onboardingMint)).supply
    assert.equal(Number(supplyBefore - supplyAfter), burnAmount, 'supply should drop by burn amount')

    const cfg = await program.account.feeConfig.fetch(feeConfig)
    assert.equal(cfg.totalBurned.toNumber(), burnAmount)
  })

  // The Jupiter buyback swap needs the live Jupiter program + a real route,
  // which isn't available on a plain local validator. Run this against a
  // mainnet fork (e.g. `anchor test --provider.cluster <fork>`) after wiring
  // the route from Jupiter's /swap-instructions API. See README.
  it.skip('swaps accrued SOL for $ONBOARDING via Jupiter (needs mainnet fork)', async () => {
    // 1. Fetch a quote + swap instructions from Jupiter for SOL -> ONBOARDING.
    // 2. Pass instruction data as `jupiter_ix_data` and every route account in
    //    remaining_accounts (plus the Jupiter program).
    // 3. Assert the vault token account balance increased.
  })
})
