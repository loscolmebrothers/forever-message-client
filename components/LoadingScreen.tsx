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
        // Wait a moment, then fade out and complete
        setTimeout(() => {
          if (overlayRef.current) {
            overlayRef.current.style.opacity = "0";
            overlayRef.current.style.filter = "blur(8px)";
          }
          setTimeout(() => {
            onComplete();
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
  }, [onPhaseChange, onComplete]);

  return (
    <>
      {/* Ocean filling overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black z-[9999] transition-all duration-1000 ease-out pointer-events-auto"
      >
        {/* Rising water effect */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-100 linear"
          style={{
            height: `${percentage}%`,
            background: "linear-gradient(to top, #1e5a7a 0%, #4682B4 100%)",
          }}
        />

        {/* Bottom content */}
        <div className="absolute bottom-10 left-0 right-0 text-center text-white font-['ApfelGrotezk',sans-serif] flex flex-col items-center gap-3">
          {/* Animated bottle above text */}
          <div
            className="w-[50px] h-[75px] relative opacity-70"
            style={{
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
          <div className="opacity-40">
            <div className="text-[13px] mb-1">Filling the ocean</div>
            <div className="text-base font-medium">{percentage}%</div>
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
    </>
  );
}
