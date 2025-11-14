"use client";

import { useState, useEffect, useRef } from "react";
import { animate as anime } from "animejs";
import Image from "next/image";

interface LoadingScreenProps {
  onComplete: () => void;
}

type LoadingPhase = 1 | 2 | 3 | 4;

const BOTTLE_SPRITES = [
  "/assets/bottle-sprites/1.webp",
  "/assets/bottle-sprites/2.webp",
  "/assets/bottle-sprites/3.webp",
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<LoadingPhase>(1);
  const [percentage, setPercentage] = useState(0);
  const [currentBottleIndex, setCurrentBottleIndex] = useState(0);
  const [showGameModal, setShowGameModal] = useState(false);

  const backgroundRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLImageElement>(null);
  const bubblesRef = useRef<HTMLDivElement>(null);

  // Phase 1: Let there be water
  useEffect(() => {
    if (phase === 1 && backgroundRef.current) {
      anime(backgroundRef.current, {
        backgroundColor: ["#000000", "#1a3d5c"],
        duration: 2000,
        ease: "inOut(quad)",
        complete: () => {
          setTimeout(() => setPhase(2), 500);
        },
      });
    }
  }, [phase]);

  // Phase 2: Crafting bottles
  useEffect(() => {
    if (phase === 2) {
      // Simulate loading with percentage counter
      const duration = 4000;
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setPercentage(Math.floor(progress));

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase(3), 500);
        }
      }, 50);

      // Cycle through bottle sprites
      const bottleInterval = setInterval(() => {
        setCurrentBottleIndex((prev) => (prev + 1) % BOTTLE_SPRITES.length);
      }, 600);

      return () => {
        clearInterval(interval);
        clearInterval(bottleInterval);
      };
    }
  }, [phase]);

  // Phase 3: Let's jump in, it's bubbling
  useEffect(() => {
    if (phase === 3 && bubblesRef.current) {
      // Create bubbles
      const bubbleContainer = bubblesRef.current;
      const bubbleCount = 20;

      for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDelay = `${Math.random() * 3}s`;
        bubble.style.animationDuration = `${3 + Math.random() * 2}s`;
        bubble.style.width = `${10 + Math.random() * 20}px`;
        bubble.style.height = bubble.style.width;
        bubbleContainer.appendChild(bubble);
      }

      // Transition background to ocean blue
      if (backgroundRef.current) {
        anime(backgroundRef.current, {
          backgroundColor: ["#1a3d5c", "#4682B4"],
          duration: 2000,
          ease: "inOut(quad)",
          complete: () => {
            setTimeout(() => setPhase(4), 500);
          },
        });
      }
    }
  }, [phase]);

  // Phase 4: Game modal
  useEffect(() => {
    if (phase === 4) {
      setTimeout(() => {
        setShowGameModal(true);
      }, 500);
    }
  }, [phase]);

  const handleContinue = () => {
    setShowGameModal(false);

    // Fade out the entire loading screen
    if (backgroundRef.current) {
      anime(backgroundRef.current, {
        opacity: [1, 0],
        duration: 800,
        ease: "out(quad)",
        complete: () => {
          onComplete();
        },
      });
    }
  };

  return (
    <div
      ref={backgroundRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Phase 1: Just background transition */}
      {phase === 1 && (
        <h2
          style={{
            color: "#fff",
            fontFamily: "ApfelGrotezk, sans-serif",
            fontSize: "clamp(18px, 4vw, 28px)",
            opacity: 0.8,
            animation: "fadeIn 1s ease-in",
          }}
        >
          Let there be water
        </h2>
      )}

      {/* Phase 2: Crafting bottles */}
      {phase === 2 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <div
            ref={bottleRef}
            style={{
              position: "relative",
              width: "clamp(100px, 20vw, 200px)",
              height: "clamp(150px, 30vw, 300px)",
              opacity: 0.3 + (percentage / 100) * 0.7,
              filter: `brightness(${0.5 + (percentage / 100) * 0.5}) drop-shadow(0 0 ${percentage / 5}px rgba(255, 255, 255, 0.6))`,
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Image
              src={BOTTLE_SPRITES[currentBottleIndex]}
              alt="Bottle"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              fontFamily: "ApfelGrotezk, sans-serif",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(18px, 4vw, 28px)",
                marginBottom: "10px",
              }}
            >
              Crafting bottles
            </h2>
            <p
              style={{
                fontSize: "clamp(36px, 8vw, 64px)",
                fontWeight: "bold",
                color: "#87CEEB",
              }}
            >
              {percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Phase 3: Bubbling */}
      {phase === 3 && (
        <>
          <div ref={bubblesRef} className="bubbles-container" />
          <h2
            style={{
              color: "#fff",
              fontFamily: "ApfelGrotezk, sans-serif",
              fontSize: "clamp(18px, 4vw, 28px)",
              opacity: 0.9,
              animation: "fadeIn 1s ease-in",
              zIndex: 1,
            }}
          >
            Let&apos;s jump in, it&apos;s bubbling
          </h2>
        </>
      )}

      {/* Phase 4: Game Modal (rendered separately) */}
      {phase === 4 && showGameModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            animation: "fadeIn 0.5s ease-in",
          }}
        >
          <div
            style={{
              width: "clamp(300px, 80vw, 500px)",
              padding: "clamp(30px, 6vw, 60px)",
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
              gap: "30px",
            }}
          >
            <h1
              style={{
                fontFamily: "ApfelGrotezk, sans-serif",
                fontSize: "clamp(28px, 6vw, 42px)",
                color: "#2c3e50",
                margin: 0,
                textAlign: "center",
              }}
            >
              Forever Message
            </h1>
            <button
              onClick={handleContinue}
              style={{
                fontFamily: "ApfelGrotezk, sans-serif",
                fontSize: "clamp(16px, 3vw, 20px)",
                padding: "12px 40px",
                backgroundColor: "#8b4513",
                color: "#f5f5dc",
                border: "2px solid #654321",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "bold",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#654321";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8b4513";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .bubbles-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .bubble {
          position: absolute;
          bottom: -50px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.8),
            rgba(135, 206, 235, 0.3)
          );
          border-radius: 50%;
          opacity: 0.6;
          animation: bubbleRise linear infinite;
        }

        @keyframes bubbleRise {
          0% {
            bottom: -50px;
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            bottom: 110%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
