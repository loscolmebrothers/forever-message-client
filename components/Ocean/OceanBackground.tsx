"use client";

import { useEffect, useRef } from "react";
import { Rect, Circle, Group } from "react-konva";
import { useFrame } from "@/hooks/useFrame";
import Konva from "konva";

interface OceanBackgroundProps {
  width: number;
  height: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
}

/**
 * Ultra-simple ocean background - just gradient and basic bubbles for performance
 */
export function OceanBackground({ width, height }: OceanBackgroundProps) {
  const bubblesRef = useRef<Bubble[]>([]);
  const groupRef = useRef<Konva.Group>(null);
  const circleRefsRef = useRef<(Konva.Circle | null)[]>([]);

  useEffect(() => {
    const area = width * height;
    const bubbleCount = Math.floor(area / 80000);

    bubblesRef.current = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 2 + Math.random() * 3, // Smaller
      speed: 0.3 + Math.random() * 1.2,
      opacity: 0.3 + Math.random() * 0.3,
    }));
  }, [width, height]);

  useFrame(() => {
    bubblesRef.current = bubblesRef.current.map((bubble, i) => {
      const newY = bubble.y - bubble.speed;

      if (newY < -50) {
        const resetBubble = {
          ...bubble,
          y: height + 50,
          x: Math.random() * width,
        };

        const circleNode = circleRefsRef.current[i];
        if (circleNode) {
          circleNode.position({ x: resetBubble.x, y: resetBubble.y });
        }

        return resetBubble;
      }

      const updatedBubble = {
        ...bubble,
        y: newY,
      };

      const circleNode = circleRefsRef.current[i];
      if (circleNode) {
        circleNode.position({ x: updatedBubble.x, y: updatedBubble.y });
      }

      return updatedBubble;
    });

    if (groupRef.current) {
      const layer = groupRef.current.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
  });

  return (
    <Group ref={groupRef}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height }}
        fillLinearGradientColorStops={[
          0,
          "#4a7a9c",
          0.15,
          "#3d6885",
          0.35,
          "#2e5570",
          0.55,
          "#244560",
          0.75,
          "#1a364f",
          1,
          "#0f2838",
        ]}
      />

      {bubblesRef.current.map((bubble, i) => (
        <Circle
          key={`bubble-${i}`}
          ref={(node) => {
            circleRefsRef.current[i] = node;
          }}
          x={bubble.x}
          y={bubble.y}
          radius={bubble.radius}
          fill={`rgba(255, 255, 255, ${bubble.opacity})`}
          listening={false}
        />
      ))}
    </Group>
  );
}
