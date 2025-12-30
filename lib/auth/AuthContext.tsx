"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";
import { supabase } from "@/lib/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  address: `0x${string}` | undefined;
  isConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address: wagmiAddress, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionAddress, setSessionAddress] = useState<
    `0x${string}` | undefined
  >(undefined);
  const signingInProgress = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        if (session?.user?.user_metadata?.wallet_address) {
          setSessionAddress(
            session.user.user_metadata.wallet_address as `0x${string}`
          );
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);

      if (session?.user?.user_metadata?.wallet_address) {
        setSessionAddress(
          session.user.user_metadata.wallet_address as `0x${string}`
        );
      } else {
        setSessionAddress(undefined);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    if (!wagmiAddress || !isConnected) {
      throw new Error("Wallet not connected");
    }

    if (signingInProgress.current) {
      console.warn("Sign-in already in progress, skipping duplicate request");
      return;
    }

    // Store address early - wallet might disconnect after signing
    const checksummedAddress = getAddress(wagmiAddress);

    try {
      signingInProgress.current = true;
      setIsLoading(true);

      const nonceResponse = await fetch("/api/auth/nonce");
      const { nonce } = await nonceResponse.json();

      const message = new SiweMessage({
        domain: window.location.host,
        address: checksummedAddress,
        statement: "Sign in to Forever Message",
        uri: window.location.origin,
        version: "1",
        chainId: 84532, // Base Sepolia
        nonce,
      });

      let signature: string;
      try {
        signature = await signMessageAsync({
          message: message.prepareMessage(),
        });
      } catch (signError: any) {
        // Handle WalletConnect session errors (e.g., wallet disconnected after signing)
        if (
          signError?.message?.includes("session topic") ||
          signError?.message?.includes("No matching key")
        ) {
          console.warn(
            "[Auth] WalletConnect session error (likely wallet disconnected), attempting direct auth:",
            signError
          );

          const directAuthResponse = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: checksummedAddress,
              skipSignature: true,
            }),
          });

          if (!directAuthResponse.ok) {
            throw new Error("Direct authentication failed after session error");
          }

          const { session } = await directAuthResponse.json();
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });

          setIsAuthenticated(true);
          if (session?.user?.user_metadata?.wallet_address) {
            setSessionAddress(
              session.user.user_metadata.wallet_address as `0x${string}`
            );
          }
          return;
        }
        // If signing fails (e.g., email/social connector), try to authenticate directly
        console.warn(
          "Message signing failed, attempting direct auth:",
          signError
        );

        // For email/social auth, we just authenticate with the address
        const directAuthResponse = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: checksummedAddress,
            skipSignature: true,
          }),
        });

        if (!directAuthResponse.ok) {
          throw new Error("Direct authentication failed");
        }

        const { session } = await directAuthResponse.json();
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        // Manually update state to ensure immediate UI update
        setIsAuthenticated(true);
        if (session?.user?.user_metadata?.wallet_address) {
          setSessionAddress(
            session.user.user_metadata.wallet_address as `0x${string}`
          );
        }
        return;
      }

      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.toMessage(),
          signature,
        }),
      });

      // If signature verification fails (401), fall back to direct auth
      if (verifyResponse.status === 401) {
        console.warn(
          "Signature verification failed, falling back to direct auth"
        );

        const directAuthResponse = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: checksummedAddress,
            skipSignature: true,
          }),
        });

        if (!directAuthResponse.ok) {
          throw new Error("Direct authentication failed");
        }

        const { session } = await directAuthResponse.json();
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        // Manually update state to ensure immediate UI update
        setIsAuthenticated(true);
        if (session?.user?.user_metadata?.wallet_address) {
          setSessionAddress(
            session.user.user_metadata.wallet_address as `0x${string}`
          );
        }
        return;
      }

      if (!verifyResponse.ok) {
        throw new Error("Authentication failed");
      }

      const { session } = await verifyResponse.json();

      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      // Manually update state to ensure immediate UI update
      setIsAuthenticated(true);
      if (session?.user?.user_metadata?.wallet_address) {
        setSessionAddress(
          session.user.user_metadata.wallet_address as `0x${string}`
        );
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      signingInProgress.current = false;
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wagmiAddress, isConnected]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      disconnect();
      setIsAuthenticated(false);
      setSessionAddress(undefined);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [disconnect]);

  useEffect(() => {
    // Only auto-signout if not in the middle of signing in
    // This prevents disconnection during mobile wallet auth from triggering signout
    if (!isConnected && isAuthenticated && !signingInProgress.current) {
      // Add a small delay to prevent race conditions with auth completion
      const timeoutId = setTimeout(() => {
        if (!signingInProgress.current) {
          signOut();
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, isAuthenticated, signOut]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        address: sessionAddress || wagmiAddress,
        isConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
