"use client";

import { useEffect, useState, useRef } from "react";
import { Group, Image as KonvaImage } from "react-konva";
import { useImage } from "react-konva-utils";

interface Sparkle {
  id: number;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  baseSize: number;
  type: "star" | "dot";
  opacity: number;
  rotation: number;
  phase: number;
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
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!isPending && !isForever) {
      setSparkles([]);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      return;
    }

    const baseOpacity = isPending ? 0.3 : 0.7;
    const count = isPending ? 6 : 10;

    const initialSparkles: Sparkle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = bottleWidth * (isPending ? 0.5 : 0.65);
      const baseX = Math.cos(angle) * distance;
      const baseY = Math.sin(angle) * distance;
      const baseSize = isPending ? 10 + Math.random() * 6 : 14 + Math.random() * 10;

      initialSparkles.push({
        id: i,
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        size: baseSize,
        baseSize,
        type: Math.random() > 0.5 ? "star" : "dot",
        opacity: baseOpacity,
        rotation: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }
    setSparkles(initialSparkles);

    let time = 0;
    const animate = () => {
      time += 0.02;

      setSparkles((prev) =>
        prev.map((sparkle) => {
          const wave = Math.sin(time + sparkle.phase);
          const pulse = 0.8 + Math.cos(time * 2 + sparkle.phase) * 0.2;

          return {
            ...sparkle,
            x: sparkle.baseX + wave * 5,
            y: sparkle.baseY + Math.cos(time + sparkle.phase) * 5,
            size: sparkle.baseSize * pulse,
            opacity: baseOpacity * (0.7 + pulse * 0.3),
            rotation: time * 50 + sparkle.id * 30,
          };
        })
      );

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
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
            rotation={sparkle.rotation}
            offsetX={sparkle.size / 2}
            offsetY={sparkle.size / 2}
            filters={[]}
          />
        );
      })}
    </Group>
  );
}
