"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  onComplete: () => void;
  onPhaseChange?: (phase: number) => void;
}

const BOTTLE_SPRITES = [
  "/assets/bottle-sprites/1.webp",
  "/assets/bottle-sprites/2.webp",
  "/assets/bottle-sprites/3.webp",
];

export function LoadingScreen({
  onComplete,
  onPhaseChange,
}: LoadingScreenProps) {
  const [percentage, setPercentage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentBottleIndex, setCurrentBottleIndex] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Ocean filling animation
  useEffect(() => {
    const duration = 4000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setPercentage(Math.floor(progress));

      if (progress >= 100) {
        clearInterval(interval);
        onPhaseChange?.(2);
        // Wait a moment, then magical fade out and show modal
        setTimeout(() => {
          if (overlayRef.current) {
            overlayRef.current.style.opacity = "0";
            overlayRef.current.style.filter = "blur(8px)";
          }
          setTimeout(() => {
            setShowModal(true);
          }, 1000);
        }, 500);
      }
    }, 50);

    // Cycle through bottle sprites
    const bottleInterval = setInterval(() => {
      setCurrentBottleIndex((prev) => (prev + 1) % BOTTLE_SPRITES.length);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(bottleInterval);
    };
  }, [onPhaseChange]);

  const handleContinue = () => {
    setShowModal(false);
    onComplete();
  };

  return (
    <>
      {/* Ocean filling overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000000",
          zIndex: 9999,
          transition: "opacity 1000ms ease-out, filter 1000ms ease-out",
          pointerEvents: showModal ? "none" : "auto",
        }}
      >
        {/* Rising water effect */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${percentage}%`,
            background: "linear-gradient(to top, #1e5a7a 0%, #4682B4 100%)",
            transition: "height 100ms linear",
          }}
        />

        {/* Bottom content */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#ffffff",
            fontFamily: "ApfelGrotezk, sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Animated bottle above text */}
          <div
            style={{
              width: "50px",
              height: "75px",
              position: "relative",
              opacity: 0.7,
              filter: "drop-shadow(0 0 12px rgba(135, 206, 235, 0.6))",
              animation: "floatBottle 2.5s ease-in-out infinite",
            }}
          >
            <Image
              src={BOTTLE_SPRITES[currentBottleIndex]}
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Text */}
          <div style={{ opacity: 0.4 }}>
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              Filling the ocean
            </div>
            <div style={{ fontSize: "16px", fontWeight: "500" }}>
              {percentage}%
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes floatBottle {
            0%,
            100% {
              transform: translateY(0px) rotate(-3deg);
            }
            50% {
              transform: translateY(-10px) rotate(3deg);
            }
          }
        `}</style>
      </div>

      {/* Forever Message Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
            animation: "fadeIn 800ms ease-out",
          }}
        >
          <div
            style={{
              width: "clamp(280px, 70vw, 450px)",
              padding: "clamp(30px, 5vw, 50px)",
              backgroundImage:
                "url(https://assets.loscolmebrothers.com/textures/parchment.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "12px",
              border: "3px solid #8b4513",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontFamily: "AndreaScript, cursive",
                fontSize: "clamp(32px, 7vw, 52px)",
                color: "#2c3e50",
                margin: 0,
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              Forever Message
            </h1>
          </div>
          <button
            onClick={handleContinue}
            style={{
              fontFamily: "ApfelGrotezk, sans-serif",
              fontSize: "clamp(14px, 2.5vw, 16px)",
              padding: "10px 30px",
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "2px solid #333333",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1a1a1a";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000000";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Continue
          </button>

          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
