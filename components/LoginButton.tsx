"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAuth } from "@/lib/auth/AuthContext";

export function LoginButton() {
  const { isAuthenticated, isLoading, address } = useAuth();
  const { open } = useAppKit();

  if (isAuthenticated) {
    return (
      <button onClick={() => open()} className="glass-button-sm">
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connected"}
      </button>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={isLoading}
      className={`glass-button-sm transition-opacity duration-200 ${
        isLoading
          ? "opacity-70 cursor-not-allowed"
          : "opacity-100 cursor-pointer"
      }`}
    >
      {isLoading ? "Loading..." : "Connect"}
    </button>
  );
}
