"use client";

import { useEffect, useState } from "react";
import { Group, Image as KonvaImage } from "react-konva";
import { useImage } from "react-konva-utils";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  type: "star" | "dot";
  opacity: number;
}

interface BottleSpriteProps {
  x: number;
  y: number;
  bottleWidth: number;
  bottleHeight: number;
  isPending?: boolean;
  isForever?: boolean;
}

export function BottleSprite({
  x,
  y,
  bottleWidth,
  bottleHeight,
  isPending = false,
  isForever = false,
}: BottleSpriteProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [starImage] = useImage("/assets/effects/sparkle-star.png");
  const [dotImage] = useImage("/assets/effects/sparkle-dot.png");

  useEffect(() => {
    if (!isPending && !isForever) {
      setSparkles([]);
      return;
    }

    const generateSparkles = () => {
      const sparkleArray: Sparkle[] = [];
      const count = 8;
      const baseOpacity = isPending ? 0.4 : 0.8;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const distance = bottleWidth * 0.6 + Math.random() * (bottleWidth * 0.2);
        sparkleArray.push({
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 12 + Math.random() * 8,
          delay: Math.random() * 2,
          type: Math.random() > 0.5 ? "star" : "dot",
          opacity: baseOpacity,
        });
      }
      setSparkles(sparkleArray);
    };

    generateSparkles();

    const interval = setInterval(generateSparkles, 3000);

    return () => clearInterval(interval);
  }, [isPending, isForever, bottleWidth]);

  if (!isPending && !isForever) return null;

  return (
    <Group x={x} y={y}>
      {sparkles.map((sparkle) => {
        const image = sparkle.type === "star" ? starImage : dotImage;
        if (!image) return null;

        return (
          <KonvaImage
            key={sparkle.id}
            image={image}
            x={sparkle.x - sparkle.size / 2}
            y={sparkle.y - sparkle.size / 2}
            width={sparkle.size}
            height={sparkle.size}
            opacity={sparkle.opacity}
          />
        );
      })}
    </Group>
  );
}
