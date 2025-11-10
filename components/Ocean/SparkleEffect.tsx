"use client";

import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  type: "star" | "dot";
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const sparkleArray: Sparkle[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 40 + Math.random() * 20;
      sparkleArray.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 16 + Math.random() * 16,
        delay: Math.random() * 0.2,
        type: Math.random() > 0.5 ? "star" : "dot",
      });
    }
    setSparkles(sparkleArray);
  }, []);

  return (
    <>
      {sparkles.map((sparkle) => (
        <img
          key={sparkle.id}
          src={`/assets/effects/sparkle-${sparkle.type}.png`}
          alt=""
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            transform: `translate(-50%, -50%) translate(${sparkle.x}px, ${sparkle.y}px)`,
            opacity: 0,
            animation: `sparkle 0.6s ease-out ${sparkle.delay}s forwards`,
            pointerEvents: "none",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0px, 0px) scale(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(${sparkles[0]?.x || 0}px, ${sparkles[0]?.y || 0}px) scale(1.5);
          }
        }
      `}</style>
    </>
  );
}
