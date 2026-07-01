import { Connection } from '@solana/web3.js'
import { RPC_URL } from '@/lib/constants'

export const connection = new Connection(RPC_URL, 'confirmed')
