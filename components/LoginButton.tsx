"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAuth } from "@/lib/auth/AuthContext";

export function LoginButton() {
  const { isAuthenticated, isLoading, address } = useAuth();
  const { open } = useAppKit();

  if (isAuthenticated) {
    return (
      <button
        onClick={() => open()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2c1810",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontFamily: "'ApfelGrotezk', sans-serif",
          fontSize: "14px",
          fontWeight: "500",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3d2418";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#2c1810";
        }}
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
      </button>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={isLoading}
      style={{
        padding: "10px 20px",
        backgroundColor: "#2c1810",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontFamily: "'ApfelGrotezk', sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        opacity: isLoading ? 0.7 : 1,
        transition: "background-color 0.2s, opacity 0.3s",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = "#3d2418";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#2c1810";
      }}
    >
      {isLoading ? "Loading..." : "Connect"}
    </button>
  );
}
