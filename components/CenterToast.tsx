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

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-emerald-500";
      case "error":
        return "border-red-500";
      case "info":
        return "border-blue-500";
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 min-w-[280px] max-w-[500px] rounded-xl backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] border ${getBorderColor()}`}
      style={{
        background: "rgba(20, 20, 30, 0.95)",
        animation: isExiting
          ? "centerToastExit 0.3s ease-out forwards"
          : "centerToastEnter 0.3s ease-out",
      }}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getIconBgColor()}`}
      >
        {getIcon()}
      </div>
      <span className="font-['ApfelGrotezk'] text-sm text-white flex-1">
        {message}
      </span>
      <button
        onClick={handleDismiss}
        className="w-5 h-5 border-none bg-transparent text-white/50 text-lg cursor-pointer flex items-center justify-center transition-colors duration-200 flex-shrink-0 p-0 hover:text-white"
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
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-3 items-center pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
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
