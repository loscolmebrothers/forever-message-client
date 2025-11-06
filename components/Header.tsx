"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect, useRef } from "react";
import { LoginButton } from "./LoginButton";

export function Header() {
  const { isConnected, isAuthenticated, signIn, address } = useAuth();
  const hasAttemptedSignIn = useRef(false);

  // Auto sign-in when wallet is connected but not authenticated
  // Only attempt once per connection to avoid infinite loops
  useEffect(() => {
    if (isConnected && !isAuthenticated && address && !hasAttemptedSignIn.current) {
      hasAttemptedSignIn.current = true;
      signIn().catch((error) => {
        console.error("Auto sign-in failed:", error);
      });
    }

    // Reset the flag when user disconnects
    if (!isConnected) {
      hasAttemptedSignIn.current = false;
    }
  }, [isConnected, isAuthenticated, address, signIn]);

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
