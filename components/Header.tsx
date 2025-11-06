"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect } from "react";
import { LoginButton } from "./LoginButton";

export function Header() {
  const { isConnected, isAuthenticated, signIn, address } = useAuth();

  // Auto sign-in when wallet is connected but not authenticated
  useEffect(() => {
    if (isConnected && !isAuthenticated && address) {
      signIn().catch((error) => {
        console.error("Auto sign-in failed:", error);
      });
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
