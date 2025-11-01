"use client";

import { useEffect, useState } from "react";
import { useBottleQueue } from "@/hooks/useBottleQueue";
import type { QueueStatus } from "@/hooks/useBottleQueue";

interface BottleQueueToastProps {
  userId: string;
}

// TODO: I'm super certain there's a library we could use for this, no need to reinvent the wheel.

export function BottleQueueToast({ userId }: BottleQueueToastProps) {
  const { queueItems } = useBottleQueue(userId);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "info" | "success" | "error" }>
  >([]);

  useEffect(() => {
    queueItems.forEach((item) => {
      const existingNotification = notifications.find((n) => n.id === item.id);

      let message = "";
      let type: "info" | "success" | "error" = "info";

      switch (item.status) {
        case "queued":
          message = "Your bottle is being prepared...";
          type = "info";
          break;
        case "uploading":
          message = "Uploading your message to IPFS...";
          type = "info";
          break;
        case "minting":
          message = "Minting bottle on blockchain...";
          type = "info";
          break;
        case "confirming":
          message = "Almost there! Confirming on-chain...";
          type = "info";
          break;
        case "completed":
          message = "Bottle cast successfully!";
          type = "success";
          break;
        case "failed":
          message = `Failed to create bottle: ${item.error || "Unknown error"}`;
          type = "error";
          break;
      }

      if (!existingNotification || existingNotification.message !== message) {
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== item.id);
          return [...filtered, { id: item.id, message, type }];
        });

        if (item.status === "completed" || item.status === "failed") {
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== item.id));
          }, 4000);
        }
      }
    });
  }, [queueItems]);

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "400px",
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor:
              notification.type === "error"
                ? "rgba(220, 38, 38, 0.95)"
                : notification.type === "success"
                  ? "rgba(34, 197, 94, 0.95)"
                  : "rgba(59, 130, 246, 0.95)",
            color: "#fff",
            padding: "16px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            fontFamily: "'ApfelGrotezk', sans-serif",
            fontSize: "14px",
            backdropFilter: "blur(10px)",
            animation: "slideInFromRight 0.3s ease-out",
            border: "2px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>
              {notification.type === "error"
                ? "❌"
                : notification.type === "success"
                  ? "✅"
                  : "⏳"}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
