"use client";

import { useEffect } from "react";
import type { Bottle } from "@loscolmebrothers/forever-message-types";

interface BottleModalProps {
  bottle: Bottle | null;
  onClose: () => void;
}

export function BottleModal({ bottle, onClose }: BottleModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (bottle) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [bottle, onClose]);

  if (!bottle) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#f5f5dc",
          borderRadius: "4px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url('https://assets.loscolmebrothers.com/textures/parchment.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            pointerEvents: "none",
            borderRadius: "4px",
          }}
        />

        <div
          style={{
            padding: "48px 32px",
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
          <h2
            style={{
              fontFamily: "'AndreaScript', cursive",
              fontSize: "32px",
              color: "#2c1810",
              margin: "0 0 16px 0",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            Under Construction
          </h2>
          <p
            style={{
              fontFamily: "'ApfelGrotezk', sans-serif",
              fontSize: "16px",
              color: "rgba(44, 24, 16, 0.7)",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            We&apos;re working on making this bottle even more special. Check
            back soon!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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
      `}</style>
    </div>
  );
}
