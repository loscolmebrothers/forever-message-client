"use client";

import Image from "next/image";
import { useState } from "react";

interface CreateBottleButtonProps {
  onClick: () => void;
  isAuthenticated: boolean;
}

export function CreateBottleButton({
  onClick,
  isAuthenticated,
}: CreateBottleButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        onMouseEnter={() => {
          if (!isAuthenticated) {
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 50,
        }}
      >
        <button
          onClick={isAuthenticated ? onClick : undefined}
          disabled={!isAuthenticated}
          className="glass-surface shadow-glass-lg transition-all duration-300"
          style={{
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            cursor: isAuthenticated ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            opacity: isAuthenticated ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          aria-label="Create bottle"
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/assets/bottle-sprites/1.webp"
              alt="Bottle"
              width={48}
              height={48}
              style={{
                width: "48px",
                height: "auto",
                objectFit: "contain",
              }}
            />
            <div
              className="shadow-glass"
              style={{
                position: "absolute",
                bottom: "-4px",
                right: "-4px",
                background:
                  "linear-gradient(135deg, rgba(64, 224, 208, 0.35) 0%, rgba(32, 178, 170, 0.45) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(127, 255, 212, 0.4)",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              +
            </div>
          </div>
        </button>
      </div>

      {showTooltip && !isAuthenticated && (
        <div
          className="glass-surface shadow-glass text-glass animate-fade-in"
          style={{
            position: "fixed",
            bottom: "120px",
            right: "32px",
            padding: "12px 16px",
            fontSize: "14px",
            whiteSpace: "nowrap",
            zIndex: 51,
            pointerEvents: "none",
            borderRadius: "8px",
          }}
        >
          Please connect your wallet to create a bottle
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              right: "32px",
              width: "0",
              height: "0",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(64, 224, 208, 0.12)",
            }}
          />
        </div>
      )}
    </div>
  );
}
