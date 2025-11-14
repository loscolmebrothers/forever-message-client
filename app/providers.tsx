"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { useState, useMemo, useEffect } from "react";
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

// Get WalletConnect Project ID
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "3fbb6bba6f1de962d911bb5b5c9dba88";

// Log warning if using placeholder (only in browser)
if (
  typeof window !== "undefined" &&
  !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
) {
  console.warn(
    "⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. Using placeholder for development.\n" +
      "   Get your project ID from: https://cloud.walletconnect.com"
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance only once per component instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable queries during SSR
            enabled: typeof window !== "undefined",
          },
        },
      })
  );

  // Track if we're on client side to trigger config recreation
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Configure connectors and wagmi config only on client side to avoid SSR issues
  const config = useMemo(() => {
    // Only initialize connectors in browser to avoid indexedDB SSR errors
    if (!isClient) {
      // Return minimal config for SSR
      return createConfig({
        chains: [baseSepolia],
        transports: {
          [baseSepolia.id]: http("https://sepolia.base.org"),
        },
        ssr: true,
      });
    }

    // Configure connectors with explicit options (client-side only)
    const connectors = connectorsForWallets(
      [
        {
          groupName: "Recommended",
          wallets: [
            metaMaskWallet,
            coinbaseWallet,
            rainbowWallet,
            walletConnectWallet,
          ],
        },
      ],
      {
        appName: "Forever Message",
        projectId,
      }
    );

    // Create full wagmi config with connectors (client-side only)
    return createConfig({
      connectors,
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http("https://sepolia.base.org"),
      },
      ssr: true,
    });
  }, [isClient]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={baseSepolia}>
          <AuthProvider>{children}</AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
