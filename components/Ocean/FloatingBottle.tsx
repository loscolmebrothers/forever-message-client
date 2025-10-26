"use client";

import { Group, Rect, Circle, Text } from "react-konva";
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
 */
export function FloatingBottle({
  bottle,
  initialX,
  initialY,
  oceanWidth,
  oceanHeight,
  onClick,
}: FloatingBottleProps) {
  // Get physics animation values
  const { x, y, rotation } = useBottlePhysics({
    initialX,
    initialY,
    oceanWidth,
    oceanHeight,
    bottleWidth: BOTTLE_VISUAL.WIDTH,
  });

  const handleClick = () => {
    onClick(bottle);
  };

  // Visual indicator for "forever" bottles
  const isForever = bottle.isForever;
  const bodyColor = isForever
    ? "rgba(255, 215, 0, 0.8)" // Golden for forever bottles
    : BOTTLE_VISUAL.BODY_COLOR;

  const outlineColor = isForever
    ? "#FFD700" // Gold outline
    : BOTTLE_VISUAL.OUTLINE_COLOR;

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      offsetX={BOTTLE_VISUAL.WIDTH / 2}
      offsetY={BOTTLE_VISUAL.HEIGHT / 2}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Bottle Body */}
      <Rect
        x={0}
        y={0}
        width={BOTTLE_VISUAL.WIDTH}
        height={BOTTLE_VISUAL.HEIGHT}
        fill={bodyColor}
        cornerRadius={BOTTLE_VISUAL.CORNER_RADIUS}
        stroke={outlineColor}
        strokeWidth={BOTTLE_VISUAL.OUTLINE_WIDTH}
      />

      {/* Bottle Cap/Cork */}
      <Circle
        x={BOTTLE_VISUAL.WIDTH / 2}
        y={BOTTLE_VISUAL.CAP_OFFSET_Y}
        radius={BOTTLE_VISUAL.CAP_RADIUS}
        fill={BOTTLE_VISUAL.CAP_COLOR}
        stroke={BOTTLE_VISUAL.OUTLINE_COLOR}
        strokeWidth={BOTTLE_VISUAL.OUTLINE_WIDTH}
      />

      {/* Bottle ID Label (for debugging/MVP) */}
      <Text
        x={0}
        y={BOTTLE_VISUAL.HEIGHT / 2 - BOTTLE_VISUAL.LABEL_FONT_SIZE / 2}
        width={BOTTLE_VISUAL.WIDTH}
        text={`#${bottle.id}`}
        fontSize={BOTTLE_VISUAL.LABEL_FONT_SIZE}
        fill={BOTTLE_VISUAL.LABEL_COLOR}
        align="center"
        fontStyle="bold"
      />

      {/* Forever indicator (sparkle/star) */}
      {isForever && (
        <Text x={BOTTLE_VISUAL.WIDTH - 15} y={-5} text="✨" fontSize={16} />
      )}
    </Group>
  );
}
