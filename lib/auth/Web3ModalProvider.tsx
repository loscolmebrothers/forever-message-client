"use client";

import { wagmiAdapter, projectId } from "@/lib/config/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";
import { ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

const queryClient = new QueryClient();

const metadata = {
  name: "Forever Message",
  description: "Messages in bottles floating in a digital ocean",
  // url: "http://localhost:3000",
  url: "https://forever-dev.loscolmebrothers.com",
  icons: ["https://assets.loscolmebrothers.com/logo.png"],
};

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia],
  defaultNetwork: baseSepolia,
  metadata,
  features: {
    analytics: true,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent-color": "#2c1810",
    "--w3m-font-family":
      "'ApfelGrotezk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } as any,
  enableWalletGuide: false,
  allowUnsupportedChain: false,
});

interface Web3ModalProviderProps {
  children: ReactNode;
  cookies?: string | null;
}

export function Web3ModalProvider({
  children,
  cookies,
}: Web3ModalProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
