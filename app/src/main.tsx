// Solana wallet-adapter + web3.js expect Node's Buffer/global in the browser.
import { Buffer } from 'buffer'
if (!(globalThis as unknown as { Buffer?: unknown }).Buffer) {
  ;(globalThis as unknown as { Buffer: unknown }).Buffer = Buffer
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// Self-hosted fonts (the identity must never fall back to system fonts).
import '@fontsource-variable/sora'
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'

import './index.css'
import { SolanaProvider } from '@/lib/solana/SolanaProvider'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SolanaProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </SolanaProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
