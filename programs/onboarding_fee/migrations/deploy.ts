// Anchor deploy migration. Runs on `anchor deploy` / `anchor migrate`.
// Extend this to call `initialize` right after deploy if you like.
import * as anchor from '@coral-xyz/anchor'

module.exports = async function (provider: anchor.Provider) {
  anchor.setProvider(provider)
  // Add post-deploy setup here (e.g. program.methods.initialize(200)...).
}
