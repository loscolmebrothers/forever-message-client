"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect, useRef } from "react";
import { LoginButton } from "./LoginButton";

export function Header() {
  const { isConnected, isAuthenticated, isLoading, signIn, address } =
    useAuth();

  const hasAttemptedSignIn = useRef(false);
  const isSigningIn = useRef(false);

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

      signIn()
        .catch((error) => {
          console.error("Auto sign-in failed:", error);
          hasAttemptedSignIn.current = false;
          isSigningIn.current = false;
        })
        .finally(() => {
          isSigningIn.current = false;
        });
    }

    if (!isConnected) {
      hasAttemptedSignIn.current = false;
      isSigningIn.current = false;
    }
  }, [isConnected, isAuthenticated, isLoading, address, signIn]);

  return (
    <header className="fixed top-5 right-5 z-[100]">
      <LoginButton />
    </header>
  );
}
