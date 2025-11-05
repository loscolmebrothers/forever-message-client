"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect } from "react";

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
        top: 0,
        left: 0,
        right: 0,
        height: "80px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderBottom: "2px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        zIndex: 100,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontFamily: "'AndreaScript', cursive",
          fontSize: "32px",
          color: "#2c1810",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        Forever Message
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {isConnected && !isAuthenticated && (
          <div
            style={{
              fontSize: "14px",
              color: "#6B7280",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Signing in...
          </div>
        )}

        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
    </header>
  );
}
