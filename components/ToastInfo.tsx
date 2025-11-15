"use client";

import { useState, useEffect } from "react";

export function ToastInfo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Watch for toast visibility
    const observer = new MutationObserver(() => {
      const toasts = document.querySelectorAll("[data-sonner-toast]");
      setIsVisible(toasts.length > 0);
    });

    const toasterContainer = document.querySelector("[data-sonner-toaster]");
    if (toasterContainer) {
      observer.observe(toasterContainer, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "8px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9998,
        pointerEvents: "none",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "8px 16px",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "12px",
          fontFamily: "ApfelGrotezk, sans-serif",
          pointerEvents: "auto",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() => {
          // Show construction modal (placeholder for now)
          alert(
            "We're working on making this feature even more special. Check back soon!"
          );
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
        }}
      >
        📍 Where exactly?
      </div>
    </div>
  );
}
