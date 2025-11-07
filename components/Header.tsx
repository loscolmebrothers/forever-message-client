"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect, useRef } from "react";
import { LoginButton } from "./LoginButton";

export function Header() {
  const { isConnected, isAuthenticated, isLoading, signIn, address } =
    useAuth();
  const hasAttemptedSignIn = useRef(false);
  const isSigningIn = useRef(false);

  // Auto sign-in when wallet is connected but not authenticated
  // Only attempt once per connection to avoid infinite loops
  useEffect(() => {
    if (
      isConnected &&
      !isAuthenticated &&
      !isLoading &&
      address &&
      !hasAttemptedSignIn.current &&
      !isSigningIn.current
    ) {
      hasAttemptedSignIn.current = true;
      isSigningIn.current = true;

      // NOTE: Small delay to ensure wallet connection is fully established
      setTimeout(() => {
        signIn()
          .catch((error) => {
            console.error("Auto sign-in failed:", error);
            // Reset flags on error so user can retry
            hasAttemptedSignIn.current = false;
            isSigningIn.current = false;
          })
          .finally(() => {
            isSigningIn.current = false;
          });
      }, 500);
    }

    // Reset the flag when user disconnects
    if (!isConnected) {
      hasAttemptedSignIn.current = false;
      isSigningIn.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isAuthenticated, isLoading, address]);

  return (
    <header
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 100,
      }}
    >
      <LoginButton />
    </header>
  );
}
