"use client";

import { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/lib/auth/AuthContext";
import { useNotifications } from "@/lib/notifications/NotificationStore";

export function LoginButton() {
  const { isAuthenticated, isLoading, signOut, address, isConnected } =
    useAuth();
  const { addNotification } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);
  const previouslyConnected = useRef(false);

  // Close menu when authentication state changes or wallet connects
  useEffect(() => {
    if (isAuthenticated || isConnected) {
      setShowMenu(false);
    }
  }, [isAuthenticated, isConnected]);

  // Force close RainbowKit modal when wallet connects
  useEffect(() => {
    if (isConnected && !previouslyConnected.current) {
      previouslyConnected.current = true;

      // Close RainbowKit modal by finding and clicking its close button or backdrop
      setTimeout(() => {
        // Try multiple methods to close the RainbowKit modal

        // Method 1: Click the close button (X)
        const closeButton = document.querySelector('[aria-label="Close"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
          return;
        }

        // Method 2: Click the backdrop/overlay
        const backdrop =
          document.querySelector('[role="dialog"]')?.parentElement;
        if (backdrop instanceof HTMLElement) {
          backdrop.click();
          return;
        }

        // Method 3: Try ESC key as fallback
        const escEvent = new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          bubbles: true,
        });
        document.dispatchEvent(escEvent);
      }, 300);
    }

    if (!isConnected) {
      previouslyConnected.current = false;
    }
  }, [isConnected]);

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
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "Connected"}
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
                  // Clear RainbowKit's wallet selection cache completely
                  if (typeof window !== "undefined") {
                    // Clear all wagmi/RainbowKit localStorage keys
                    Object.keys(localStorage).forEach((key) => {
                      if (key.startsWith("wagmi.") || key.startsWith("rk-")) {
                        localStorage.removeItem(key);
                      }
                    });
                  }
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
          transition: "opacity 0.3s",
        }}
      >
        {isLoading ? "Loading..." : "Login"}
      </button>

      {showMenu && !isLoading && (
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
                addNotification({
                  type: "info",
                  message: "Email login coming soon!",
                });
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
