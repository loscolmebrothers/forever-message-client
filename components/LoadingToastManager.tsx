"use client";

import { useNotifications } from "@/lib/notifications/NotificationStore";

function LoadingToastItem({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(20, 20, 30, 0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        animation: "slideUp 0.3s ease-out",
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
        }}
      />
      <span
        style={{
          fontFamily: "ApfelGrotezk, sans-serif",
          fontSize: "14px",
          color: "#ffffff",
        }}
      >
        {message}
      </span>
    </div>
  );
}

export function LoadingToastManager() {
  const { loadingToasts } = useNotifications();

  if (loadingToasts.size === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {Array.from(loadingToasts.values()).map((message, index) => (
          <LoadingToastItem key={index} message={message} />
        ))}
      </div>
    </>
  );
}
