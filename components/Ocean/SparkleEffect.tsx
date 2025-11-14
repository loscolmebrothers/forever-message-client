"use client";

import { useEffect, useState, useRef } from "react";
import { animate as anime } from "animejs";

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
  const containerRef = useRef<HTMLDivElement>(null);

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
        delay: Math.random() * 300,
        type: Math.random() > 0.5 ? "star" : "dot",
        rotation: Math.random() * 360,
        duration: 600 + Math.random() * 300,
      });
    }
    setSparkles(sparkleArray);
  }, []);

  useEffect(() => {
    if (!containerRef.current || sparkles.length === 0) return;

    sparkles.forEach((sparkle) => {
      const el = containerRef.current?.querySelector(
        `[data-sparkle-id="${sparkle.id}"]`
      );
      if (!el) return;

      anime(el, {
        translateX: ["0px", `${sparkle.x}px`],
        translateY: ["0px", `${sparkle.y}px`],
        scale: [0, 1.2],
        rotate: [0, 180],
        opacity: [
          { value: 0, duration: 0 },
          { value: 1, duration: sparkle.duration * 0.3 },
          { value: 0, duration: sparkle.duration * 0.7 },
        ],
        duration: sparkle.duration,
        delay: sparkle.delay,
        ease: "out(expo)",
      });

      const imgEl = el.querySelector("img");
      if (imgEl) {
        anime(imgEl, {
          rotate: [0, sparkle.rotation],
          duration: sparkle.duration,
          delay: sparkle.delay,
          ease: "linear",
        });
      }
    });
  }, [sparkles]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          data-sparkle-id={sparkle.id}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <img
            src={`/assets/effects/sparkle-${sparkle.type}.png`}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              filter:
                "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) brightness(1.3)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
