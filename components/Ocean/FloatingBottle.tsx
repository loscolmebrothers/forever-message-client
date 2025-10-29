"use client";

import { Group, Image, Circle, Text } from "react-konva";
import { useImage } from "react-konva-utils";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { BOTTLE_VISUAL } from "@/lib/constants";
import { useBottlePhysics } from "@/hooks/useBottlePhysics";

interface FloatingBottleProps {
  bottle: Bottle;
  initialX: number;
  initialY: number;
  oceanWidth: number;
  oceanHeight: number;
  onClick: (bottle: Bottle) => void;
}

/**
 * FloatingBottle Component
 * Renders an individual bottle with autonomous physics-based movement
 * Uses sprite 1 for regular bottles, sprite 2 for forever bottles
 */
export function FloatingBottle({
  bottle,
  initialX,
  initialY,
  oceanWidth,
  oceanHeight,
  onClick,
}: FloatingBottleProps) {
  const isForever = bottle.isForever || bottle.id === 1;

  const spriteNumber = isForever ? 2 : 1;
  const [bottleImage] = useImage(`/assets/bottle-sprites/${spriteNumber}.png`);

  const SCALE = 1.5;

  const imageWidth = bottleImage?.width || BOTTLE_VISUAL.WIDTH;
  const imageHeight = bottleImage?.height || BOTTLE_VISUAL.HEIGHT;

  const scaledWidth = imageWidth * SCALE;
  const scaledHeight = imageHeight * SCALE;

  const { x, y, rotation } = useBottlePhysics({
    initialX,
    initialY,
    oceanWidth,
    oceanHeight,
    bottleWidth: scaledWidth,
  });

  const handleClick = () => {
    onClick(bottle);
  };

  const handleMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = "pointer";
    }
  };

  const handleMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = "default";
    }
  };

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      offsetX={scaledWidth / 2}
      offsetY={scaledHeight / 2}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      scaleX={SCALE}
      scaleY={SCALE}
    >
      {/* Glow effect for forever bottles */}
      {isForever && bottleImage && (
        <Circle
          x={imageWidth / 2}
          y={imageHeight / 2}
          radius={imageWidth}
          fill="rgba(255, 215, 0, 0.3)"
          shadowColor="#FFD700"
          shadowBlur={20}
          shadowOpacity={0.8}
        />
      )}

      {/* Bottle Sprite (natural aspect ratio, scaled via Group) */}
      {bottleImage && <Image image={bottleImage} x={0} y={0} />}

      {/* Forever indicator (sparkle/star) */}
      {isForever && <Text x={imageWidth - 15} y={-5} text="✨" fontSize={16} />}
    </Group>
  );
}
