"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

export function LoginButton() {
  const { isAuthenticated, signOut, address } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (isAuthenticated) {
    // Show logged in state with disconnect option
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
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
          }}
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>

        {showMenu && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
              onClick={() => setShowMenu(false)}
            />
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                minWidth: "200px",
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'ApfelGrotezk', sans-serif",
                  fontSize: "14px",
                  color: "#DC2626",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEE2E2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Show login options
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
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
        }}
      >
        Login
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "200px",
              padding: "8px",
              zIndex: 1000,
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={() => {
                      openConnectModal();
                      setShowMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "'ApfelGrotezk', sans-serif",
                      fontSize: "14px",
                      borderRadius: "4px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    🔗 Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>

            <button
              onClick={() => {
                toast.info("Email login coming soon!");
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "'ApfelGrotezk', sans-serif",
                fontSize: "14px",
                borderRadius: "4px",
                color: "#6B7280",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✉️ Sign in with Email
            </button>
          </div>
        </>
      )}
    </div>
  );
}
