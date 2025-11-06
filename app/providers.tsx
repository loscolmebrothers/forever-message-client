'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { useState } from 'react'

// Get WalletConnect Project ID or use placeholder for local testing
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3fbb6bba6f1de962d911bb5b5c9dba88'

// Log warning if using placeholder (only in browser)
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    '⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. Using placeholder for development.\n' +
    '   Get your project ID from: https://cloud.walletconnect.com'
  )
}

// Use getDefaultConfig to get all RainbowKit wallet connectors
const config = getDefaultConfig({
  appName: 'Forever Message',
  projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance only once per component instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Disable queries during SSR
        enabled: typeof window !== 'undefined',
      },
    },
  }))

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={baseSepolia}>
          <AuthProvider>{children}</AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
