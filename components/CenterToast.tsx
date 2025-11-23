"use client";

import { useNotifications } from "@/lib/notifications/NotificationStore";
import { useState } from "react";

function Toast({
  id,
  type,
  message,
  onDismiss,
}: {
  id: string;
  type: "success" | "error" | "info";
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

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
        return "ℹ";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "info":
        return "#3b82f6";
    }
  };

  return (
    <div
      style={{
        background: "rgba(20, 20, 30, 0.95)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${getColor()}`,
        borderRadius: "12px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        animation: isExiting
          ? "centerToastExit 0.3s ease-out forwards"
          : "centerToastEnter 0.3s ease-out",
        minWidth: "280px",
        maxWidth: "500px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: getColor(),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {getIcon()}
      </div>
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
          fontSize: "18px",
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

export function CenterToast() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes centerToastEnter {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes centerToastExit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {notifications.map((notification) => (
          <div key={notification.id} style={{ pointerEvents: "auto" }}>
            <Toast
              id={notification.id}
              type={notification.type}
              message={notification.message}
              onDismiss={removeNotification}
            />
          </div>
        ))}
      </div>
    </>
  );
}
