"use client";

import { useState, useEffect } from "react";
import {
  useNotifications,
  type Notification,
} from "@/lib/notifications/NotificationStore";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📬";
    }
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "8px",
        padding: "12px 16px",
        margin: "8px 12px",
        position: "relative",
        animation: isExiting
          ? "toastExit 0.3s ease-out forwards"
          : "toastEnter 0.3s ease-out",
      }}
    >
      <button
        onClick={handleDismiss}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
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
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          paddingRight: "20px",
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: "1" }}>
          {getIcon(notification.type)}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "ApfelGrotezk, sans-serif",
              fontSize: "14px",
              color: "#ffffff",
              marginBottom: "4px",
            }}
          >
            {notification.message}
          </div>
          {notification.bottleId && (
            <div
              style={{
                fontFamily: "ApfelGrotezk, sans-serif",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.6)",
                marginBottom: "2px",
              }}
            >
              Bottle #{notification.bottleId}
            </div>
          )}
          <div
            style={{
              fontFamily: "ApfelGrotezk, sans-serif",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            {formatTimeAgo(notification.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationSidebar() {
  const { notifications, removeNotification, clearAll } = useNotifications();
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <style jsx global>{`
        @keyframes toastEnter {
          from {
            transform: translateX(20px);
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

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            background: "rgba(20, 20, 30, 0.9)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: "8px 0 0 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            zIndex: 1000,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(30, 30, 40, 0.95)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(20, 20, 30, 0.9)";
          }}
        >
          🔔
          {unreadCount > 0 && (
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
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
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
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: isMobile ? "90vw" : "320px",
          height: "100vh",
          background: "rgba(20, 20, 30, 0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontFamily: "ApfelGrotezk, sans-serif",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#ffffff",
              margin: 0,
            }}
          >
            Notifications
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "24px",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <div
                style={{
                  fontFamily: "ApfelGrotezk, sans-serif",
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              >
                No notifications yet
              </div>
            </div>
          ) : (
            <>
              {notifications.length > 1 && (
                <div style={{ padding: "8px 12px", textAlign: "right" }}>
                  <button
                    onClick={clearAll}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "4px",
                      padding: "4px 12px",
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
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={removeNotification}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
