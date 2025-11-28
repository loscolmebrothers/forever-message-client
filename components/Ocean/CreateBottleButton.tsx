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
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            border: "none",
            cursor: isAuthenticated ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.3s, box-shadow 0.3s, opacity 0.3s",
            padding: "8px",
            opacity: isAuthenticated ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
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
              style={{
                position: "absolute",
                bottom: "-4px",
                right: "-4px",
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              +
            </div>
          </div>
        </button>
      </div>

      {showTooltip && !isAuthenticated && (
        <div
          style={{
            position: "fixed",
            bottom: "120px",
            right: "32px",
            backgroundColor: "#2c1810",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "'ApfelGrotezk', sans-serif",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            zIndex: 51,
            pointerEvents: "none",
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
              borderTop: "6px solid #2c1810",
            }}
          />
        </div>
      )}
    </div>
  );
}
