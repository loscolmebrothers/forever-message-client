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
      className="glass-button-sm"
      style={{
        opacity: isLoading ? 0.7 : 1,
        cursor: isLoading ? "not-allowed" : "pointer",
      }}
    >
      {isLoading ? "Loading..." : "Connect"}
    </button>
  );
}
