"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/lib/notifications/NotificationStore";
import BellIcon from "./BellIcon";
import { useAccount } from "wagmi";
import { BottleProgressToast, CompletionToast } from "./Toast";

export default function Sidebar() {
  const { isConnected } = useAccount();
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

  if (!isConnected) {
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
