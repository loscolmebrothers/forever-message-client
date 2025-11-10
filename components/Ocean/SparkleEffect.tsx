"use client";

import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  type: "star" | "dot";
  rotation: number;
  duration: number;
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const sparkleArray: Sparkle[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      sparkleArray.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 20 + Math.random() * 20,
        delay: Math.random() * 0.3,
        type: Math.random() > 0.5 ? "star" : "dot",
        rotation: Math.random() * 360,
        duration: 0.6 + Math.random() * 0.3,
      });
    }
    setSparkles(sparkleArray);
  }, []);

  return (
    <>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            transform: `translate(-50%, -50%)`,
            pointerEvents: "none",
            animation: `sparkle-burst ${sparkle.duration}s ease-out ${sparkle.delay}s forwards`,
            willChange: "transform, opacity",
          }}
        >
          <img
            src={`/assets/effects/sparkle-${sparkle.type}.png`}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) brightness(1.3)",
              animation: `sparkle-spin ${sparkle.duration}s linear ${sparkle.delay}s forwards, sparkle-pulse ${sparkle.duration * 0.5}s ease-in-out ${sparkle.delay}s 2`,
              transformOrigin: "center",
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes sparkle-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0px, 0px) scale(0) rotate(0deg);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(${sparkles[0]?.x || 0}px, ${sparkles[0]?.y || 0}px) scale(1.2) rotate(180deg);
          }
        }
        @keyframes sparkle-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(${sparkles[0]?.rotation || 360}deg);
          }
        }
        @keyframes sparkle-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) brightness(1.3);
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(255, 215, 0, 1)) brightness(1.6);
          }
        }
      `}</style>
    </>
  );
}
