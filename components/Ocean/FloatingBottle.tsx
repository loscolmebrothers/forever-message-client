"use client";

import { useEffect, useState } from "react";
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
  animationDelay?: number;
}

/**
 * FloatingBottle Component
 * Renders an individual bottle with autonomous physics-based movement
 * Uses sprite 1 for regular bottles, sprite 2 for forever bottles
 * Fades in smoothly on first appearance
 */
export function FloatingBottle({
  bottle,
  initialX,
  initialY,
  oceanWidth,
  oceanHeight,
  onClick,
  animationDelay = 0,
}: FloatingBottleProps) {
  const [opacity, setOpacity] = useState(0);
  const [entranceScale, setEntranceScale] = useState(0.8);
  const [isHovered, setIsHovered] = useState(false);
  const isForever = bottle.isForever || bottle.id === 1;

  const isPending = (bottle as any).blockchainStatus === "pending";
  const queueStatus = (bottle as any).queueStatus;
  const queueProgress = (bottle as any).queueProgress || 0;

  const spriteNumber = isForever ? 2 : 1;
  const [bottleImage] = useImage(`/assets/bottle-sprites/${spriteNumber}.webp`);

  const SPRITE_BASE_SCALE = 1.5; // Base scale for bottle sprite size

  const imageWidth = bottleImage?.width || BOTTLE_VISUAL.WIDTH;
  const imageHeight = bottleImage?.height || BOTTLE_VISUAL.HEIGHT;

  const scaledWidth = imageWidth * SPRITE_BASE_SCALE;
  const scaledHeight = imageHeight * SPRITE_BASE_SCALE;

  const { x, y, rotation } = useBottlePhysics({
    initialX,
    initialY,
    oceanWidth,
    oceanHeight,
    bottleWidth: scaledWidth,
  });

  // Smooth fade-in animation on mount (faster entrance)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Animate opacity from 0 to 1
      let currentOpacity = 0;
      let currentEntranceScale = 0.8;
      const duration = 300; // 300ms animation (faster)
      const steps = 20; // Fewer steps for faster animation
      const opacityStep = 1 / steps;
      const scaleStep = 0.2 / steps; // From 0.8 to 1.0
      const interval = duration / steps;

      const animationInterval = setInterval(() => {
        currentOpacity += opacityStep;
        currentEntranceScale += scaleStep;

        if (currentOpacity >= 1) {
          setOpacity(1);
          setEntranceScale(1);
          clearInterval(animationInterval);
        } else {
          setOpacity(currentOpacity);
          setEntranceScale(currentEntranceScale);
        }
      }, interval);

      return () => clearInterval(animationInterval);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleClick = () => {
    onClick(bottle);
  };

  const handleMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = "pointer";
    }
    setIsHovered(true);
  };

  const handleMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = "grab";
    }
    setIsHovered(false);
  };

  // Calculate hover scale (like CreateBottleButton)
  const hoverScale = isHovered ? 1.1 : 1;

  const [pulseOpacity, setPulseOpacity] = useState(1);

  useEffect(() => {
    if (!isPending) return;

    let pulseValue = 1;
    let increasing = false;
    const pulseInterval = setInterval(() => {
      if (increasing) {
        pulseValue += 0.02;
        if (pulseValue >= 1) increasing = false;
      } else {
        pulseValue -= 0.02;
        if (pulseValue <= 0.6) increasing = true;
      }
      setPulseOpacity(pulseValue);
    }, 50);

    return () => clearInterval(pulseInterval);
  }, [isPending]);

  const finalOpacity = isPending ? opacity * pulseOpacity * 0.7 : opacity;

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
      scaleX={SPRITE_BASE_SCALE * entranceScale * hoverScale}
      scaleY={SPRITE_BASE_SCALE * entranceScale * hoverScale}
      opacity={finalOpacity}
    >
      {isPending && bottleImage && (
        <Circle
          x={imageWidth / 2}
          y={imageHeight / 2}
          radius={imageWidth * 1.2}
          fill="rgba(100, 150, 255, 0.2)"
          shadowColor="#6495FF"
          shadowBlur={15}
          shadowOpacity={0.6 * pulseOpacity}
        />
      )}

      {isForever && !isPending && bottleImage && (
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

      {bottleImage && (
        <Image alt="Bottle sprite image" image={bottleImage} x={0} y={0} />
      )}
    </Group>
  );
}
