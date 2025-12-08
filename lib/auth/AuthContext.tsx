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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const signingInProgress = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
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

    try {
      signingInProgress.current = true;
      setIsLoading(true);

      const nonceResponse = await fetch("/api/auth/nonce");
      const { nonce } = await nonceResponse.json();

      const checksummedAddress = getAddress(wagmiAddress);

      const message = new SiweMessage({
        domain: window.location.host,
        address: checksummedAddress,
        statement: "Sign in to Forever Message",
        uri: window.location.origin,
        version: "1",
        chainId: 84532, // Base Sepolia
        nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Authentication failed");
      }

      const { session } = await verifyResponse.json();

      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      setIsAuthenticated(true);
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
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [disconnect]);

  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      signOut();
    }
  }, [isConnected, isAuthenticated, signOut]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
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
