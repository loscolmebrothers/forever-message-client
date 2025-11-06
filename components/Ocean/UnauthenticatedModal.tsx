"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface UnauthenticatedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnauthenticatedModal({
  isOpen,
  onClose,
}: UnauthenticatedModalProps) {
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [bottleFloat, setBottleFloat] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = "https://assets.loscolmebrothers.com/textures/parchment.jpg";
    img.onload = () => setTextureLoaded(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Animate bottle floating up and down
    let frame = 0;
    const animate = () => {
      frame += 0.05;
      setBottleFloat(Math.sin(frame) * 10);
      if (isOpen) requestAnimationFrame(animate);
    };
    animate();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!textureLoaded) {
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
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5dc",
            borderRadius: "4px",
            padding: "48px 40px",
            maxWidth: "500px",
            width: "100%",
            margin: "0 16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
          }}
        >
          <div
            style={{
              fontFamily: "'AndreaScript', cursive",
              fontSize: "24px",
              color: "#2c1810",
            }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
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
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#f5f5dc",
          borderRadius: "4px",
          padding: "48px 40px",
          maxWidth: "500px",
          width: "100%",
          margin: "0 16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background texture */}
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

        {/* Quirky close button (X) */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "36px",
            height: "36px",
            border: "3px solid #8b4513",
            background: "#f5f5dc",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#8b4513",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            transform: "rotate(0deg)",
            transition: "all 0.3s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            e.currentTarget.style.backgroundColor = "#8b4513";
            e.currentTarget.style.color = "#f5f5dc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            e.currentTarget.style.backgroundColor = "#f5f5dc";
            e.currentTarget.style.color = "#8b4513";
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Floating bottle animation */}
          <div
            style={{
              transform: `translateY(${bottleFloat}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <img
              src="/assets/bottle-sprites/1.webp"
              alt="Message in a bottle"
              style={{
                width: "120px",
                height: "auto",
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
              }}
            />
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'AndreaScript', cursive",
              fontSize: "32px",
              color: "#2c1810",
              margin: 0,
              textAlign: "center",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            New bottles are bottles
          </h2>

          {/* Message */}
          <p
            style={{
              fontFamily: "'AndreaScript', cursive",
              fontSize: "24px",
              color: "#8b4513",
              margin: 0,
              textAlign: "center",
              lineHeight: "1.6",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            Please sign in to create a bottle
          </p>

          {/* Connect Wallet Button */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                style={{
                  padding: "14px 36px",
                  border: "3px solid #5d4037",
                  background: "rgba(139, 69, 19, 0.3)",
                  color: "#2c1810",
                  cursor: "pointer",
                  fontFamily: "'AndreaScript', cursive",
                  fontSize: "26px",
                  transition: "all 0.3s",
                  textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
                  borderRadius: "4px",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 69, 19, 0.5)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(139, 69, 19, 0.3)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Connect Wallet 🔗
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  );
}
