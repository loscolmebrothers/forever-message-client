"use client";

import { useState, useEffect } from "react";
import {
  useNotifications,
  CompletionNotification,
} from "@/lib/notifications/NotificationStore";
import { BellIcon } from "./BellIcon";
import { useAuth } from "@/lib/auth/AuthContext";

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
      className="glass-notification flex items-center gap-3 relative mx-3 my-2"
      style={{
        animation: isExiting
          ? "toastExit 0.3s ease-out forwards"
          : "toastEnter 0.3s ease-out",
      }}
    >
      <div
        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white flex-shrink-0"
        style={{
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span className="text-glass text-sm flex-1">{message}</span>
      <button
        onClick={handleDismiss}
        className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200 cursor-pointer flex-shrink-0 p-0 border-0 bg-transparent text-base"
      >
        ×
      </button>
    </div>
  );
}

function CompletionToast({
  notification,
  onDismiss,
}: {
  notification: CompletionNotification;
  onDismiss: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const ipfsGateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://storacha.link/ipfs";
  const ipfsUrl = notification.ipfsCid
    ? `${ipfsGateway}/${notification.ipfsCid}`
    : null;
  const blockchainUrl = notification.transactionHash
    ? `https://sepolia.basescan.org/tx/${notification.transactionHash}`
    : null;

  return (
    <div
      className="glass-notification relative mx-3 my-2"
      style={{
        animation: isExiting
          ? "toastExit 0.3s ease-out forwards"
          : "toastEnter 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-glass font-apfel text-sm flex-1">
          {notification.message}
        </span>
        <button
          onClick={handleDismiss}
          className="w-5 h-5 flex items-center justify-center text-glass-text/50 hover:text-glass-text transition-colors duration-200 cursor-pointer flex-shrink-0 p-0 border-0 bg-transparent text-base"
        >
          ×
        </button>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-transparent border-0 py-1 px-0 cursor-pointer flex items-center gap-1.5 font-apfel text-xs text-glass-text/60 hover:text-glass-text transition-colors duration-200"
      >
        <span>Where exactly?</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            d="M2 4 L6 8 L10 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div
          className="mt-3 pt-3 border-t border-glass-border flex gap-2"
          style={{
            animation: "expandIn 0.2s ease-out",
          }}
        >
          {ipfsUrl && (
            <a
              href={ipfsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-glass-tint border border-glass-border hover:bg-glass-tint-dark hover:border-glass-border-dark rounded-md font-apfel text-xs text-glass-text text-center no-underline transition-all duration-200 font-medium"
            >
              IPFS
            </a>
          )}
          {blockchainUrl && (
            <a
              href={blockchainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-glass-tint border border-glass-border hover:bg-glass-tint-dark hover:border-glass-border-dark rounded-md font-apfel text-xs text-glass-text text-center no-underline transition-all duration-200 font-medium"
            >
              Blockchain
            </a>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes expandIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export function NotificationSidebar() {
  const { isAuthenticated } = useAuth();
  const {
    loadingToasts,
    removeLoadingToast,
    completionNotifications,
    removeCompletionNotification,
  } = useNotifications();
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

  const toastCount = loadingToasts.size + completionNotifications.length;

  const handleClearAll = () => {
    Array.from(loadingToasts.keys()).forEach((id) => {
      removeLoadingToast(id);
    });
    completionNotifications.forEach((notification) => {
      removeCompletionNotification(notification.id);
    });
  };

  if (!isAuthenticated) {
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

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 w-12 h-12 glass-surface-dark rounded-r-lg cursor-pointer flex items-center justify-center text-xl z-[1000] transition-all duration-300 ease-out hover:w-14 hover:scale-105 active:scale-100"
          style={{
            animation:
              toastCount > 0 ? "tabPulse 2s ease-in-out infinite" : "none",
            boxShadow:
              "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 rgba(127, 255, 212, 0)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 25px rgba(127, 255, 212, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 rgba(127, 255, 212, 0)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 0 0.5px rgba(0, 0, 0, 0.25), 0 16px 40px rgba(0, 0, 0, 0.25), 0 0 35px rgba(127, 255, 212, 0.55)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 25px rgba(127, 255, 212, 0.35)";
          }}
        >
          <BellIcon hasNotifications={toastCount > 0} />
          {toastCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-apfel font-bold">
              {toastCount > 9 ? "9+" : toastCount}
            </span>
          )}
        </button>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-[999] animate-fade-in"
        />
      )}

      {isOpen && (
        <div
          className={`fixed left-0 top-0 h-screen glass-surface-dark shadow-glass-lg z-[1000] flex flex-col ${
            isMobile ? "w-[90vw]" : "w-[320px]"
          }`}
          style={{
            animation: "slideInFromLeft 0.3s ease-out",
          }}
        >
          <div className="flex justify-end p-4 pb-2">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-white/10 border border-white/20 rounded-md text-white/70 text-xl cursor-pointer w-8 h-8 flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 hover:text-white hover:bg-white/15 active:scale-100"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 rgba(127, 255, 212, 0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15), 0 0 18px rgba(127, 255, 212, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 rgba(127, 255, 212, 0)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.25), 0 12px 28px rgba(0, 0, 0, 0.2), 0 0 28px rgba(127, 255, 212, 0.4)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15), 0 0 18px rgba(127, 255, 212, 0.25)";
              }}
            >
              ←
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-4">
            {completionNotifications.map((notification) => (
              <CompletionToast
                key={notification.id}
                notification={notification}
                onDismiss={removeCompletionNotification}
              />
            ))}
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
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md font-apfel text-xs text-white/70 cursor-pointer transition-all duration-300 ease-out hover:scale-102 hover:text-white hover:bg-white/15 active:scale-100"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 rgba(127, 255, 212, 0)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15), 0 0 18px rgba(127, 255, 212, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 rgba(127, 255, 212, 0)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.25), 0 12px 28px rgba(0, 0, 0, 0.2), 0 0 28px rgba(127, 255, 212, 0.4)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15), 0 0 18px rgba(127, 255, 212, 0.25)";
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
