"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/lib/notifications/NotificationStore";
import { BellIcon } from "./BellIcon";

function BottleProgressToast({
  id,
  message,
  onDismiss,
}: {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  return (
    <div
      style={{
        background: "rgba(20, 20, 30, 0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        padding: "14px 20px",
        margin: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        animation: isExiting
          ? "toastExit 0.3s ease-out forwards"
          : "toastEnter 0.3s ease-out",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderTop: "2px solid #ffffff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "ApfelGrotezk, sans-serif",
          fontSize: "14px",
          color: "#ffffff",
          flex: 1,
        }}
      >
        {message}
      </span>
      <button
        onClick={handleDismiss}
        style={{
          width: "20px",
          height: "20px",
          border: "none",
          background: "none",
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.2s ease",
          flexShrink: 0,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
        }}
      >
        ×
      </button>
    </div>
  );
}

export function NotificationSidebar() {
  const { loadingToasts, removeLoadingToast } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toastCount = loadingToasts.size;

  useEffect(() => {
    if (toastCount > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [toastCount, isOpen]);

  const handleClearAll = () => {
    Array.from(loadingToasts.keys()).forEach((id) => {
      removeLoadingToast(id);
    });
  };

  if (toastCount === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @keyframes toastEnter {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toastExit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes tabPulse {
          0%,
          100% {
            transform: translateY(-50%) scale(1);
          }
          50% {
            transform: translateY(-50%) scale(1.05);
          }
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOutToLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>

      {!isOpen && toastCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            background: "rgba(20, 20, 30, 0.9)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            zIndex: 1000,
            transition: "all 0.2s ease",
            animation:
              toastCount > 0 ? "tabPulse 2s ease-in-out infinite" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(30, 30, 40, 0.95)";
            e.currentTarget.style.width = "56px";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(20, 20, 30, 0.9)";
            e.currentTarget.style.width = "48px";
          }}
        >
          <BellIcon hasNotifications={toastCount > 0} />
          {toastCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "18px",
                height: "18px",
                background: "#ff4444",
                borderRadius: "50%",
                fontSize: "10px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "ApfelGrotezk, sans-serif",
                fontWeight: "bold",
              }}
            >
              {toastCount > 9 ? "9+" : toastCount}
            </span>
          )}
        </button>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            animation: "fadeIn 0.3s ease-out",
          }}
        />
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: isMobile ? "90vw" : "320px",
            height: "100vh",
            background: "rgba(20, 20, 30, 0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "4px 0 24px rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            animation: "slideInFromLeft 0.3s ease-out",
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "24px",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s ease",
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
            }}
          >
            ×
          </button>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              paddingTop: "16px",
              paddingBottom: "16px",
            }}
          >
            {Array.from(loadingToasts.entries()).map(([id, message]) => (
              <BottleProgressToast
                key={id}
                id={id}
                message={message}
                onDismiss={removeLoadingToast}
              />
            ))}
          </div>

          {toastCount > 1 && (
            <div
              style={{
                padding: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={handleClearAll}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "6px",
                  fontFamily: "ApfelGrotezk, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                }}
              >
                Close all
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
