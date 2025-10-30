"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useWindowSize } from "usehooks-ts";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { OceanBackground } from "./OceanBackground";
import { FloatingBottle } from "./FloatingBottle";
import { BottleModal } from "./BottleModal";
import { CreateBottleButton } from "./CreateBottleButton";
import { CreateBottleModal } from "./CreateBottleModal";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { useBottles } from "@/hooks/useBottles";
import { getRandomBottlePosition } from "@/lib/bottle-utils";
import { OCEAN } from "@/lib/constants";
import type Konva from "konva";

// Ocean is 5x the viewport size (like Google Maps)
const OCEAN_SCALE = 5;

// Viewport culling padding - render bottles slightly outside viewport for smooth transitions
const CULLING_PADDING = 200;

interface BottleWithPosition extends Bottle {
  position: { x: number; y: number };
  animationDelay: number;
}

export function OceanStage() {
  const { width, height } = useWindowSize();
  const { bottles, isLoading, error, isEmpty, mutate } = useBottles();
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);

  // Calculate actual ocean dimensions (5x viewport)
  const oceanWidth = width * OCEAN_SCALE;
  const oceanHeight = height * OCEAN_SCALE;

  // Generate random initial positions for each bottle (stable across renders)
  // Position bottles across the full 5x ocean, not just viewport
  const bottlesWithPositions = useMemo<BottleWithPosition[]>(() => {
    if (width === 0 || height === 0) return [];

    return bottles.map((bottle, index) => ({
      ...bottle,
      position: getRandomBottlePosition(oceanWidth, oceanHeight, OCEAN.EDGE_PADDING),
      animationDelay: index * 50, // Stagger animations by 50ms
    }));
  }, [bottles, oceanWidth, oceanHeight]);

  // Viewport culling - only render bottles visible in current viewport
  const visibleBottles = useMemo(() => {
    const viewportX = -stagePos.x;
    const viewportY = -stagePos.y;
    const viewportWidth = width;
    const viewportHeight = height;

    return bottlesWithPositions.filter(({ position }) => {
      return (
        position.x >= viewportX - CULLING_PADDING &&
        position.x <= viewportX + viewportWidth + CULLING_PADDING &&
        position.y >= viewportY - CULLING_PADDING &&
        position.y <= viewportY + viewportHeight + CULLING_PADDING
      );
    });
  }, [bottlesWithPositions, stagePos, width, height]);

  const handleBottleClick = (bottle: Bottle) => {
    setSelectedBottle(bottle);
  };

  const handleCloseModal = () => {
    setSelectedBottle(null);
  };

  const handleBottleCreated = () => {
    mutate();
  };

  // Handle stage drag for panning
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage;
    const newPos = stage.position();

    // Constrain panning to ocean bounds
    const maxX = 0;
    const minX = -(oceanWidth - width);
    const maxY = 0;
    const minY = -(oceanHeight - height);

    const constrainedPos = {
      x: Math.max(minX, Math.min(maxX, newPos.x)),
      y: Math.max(minY, Math.min(maxY, newPos.y)),
    };

    stage.position(constrainedPos);
    setStagePos(constrainedPos);
  }, [oceanWidth, oceanHeight, width, height]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <LoadingState />
        <CreateBottleButton onClick={() => setIsCreateModalOpen(true)} />
        <CreateBottleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleBottleCreated}
        />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <ErrorState error={error} />
        <CreateBottleButton onClick={() => setIsCreateModalOpen(true)} />
        <CreateBottleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleBottleCreated}
        />
      </>
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <>
        <EmptyState />
        <CreateBottleButton onClick={() => setIsCreateModalOpen(true)} />
        <CreateBottleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleBottleCreated}
        />
      </>
    );
  }

  // Don't render until we have valid dimensions
  if (width === 0 || height === 0) {
    return null;
  }

  return (
    <>
      <Stage
        width={width}
        height={height}
        draggable
        onDragEnd={handleDragEnd}
        ref={stageRef}
        x={stagePos.x}
        y={stagePos.y}
      >
        {/* Ocean background - render full 5x ocean */}
        <Layer listening={false}>
          <OceanBackground width={oceanWidth} height={oceanHeight} />
        </Layer>

        {/* Bottles layer - only render visible bottles */}
        <Layer>
          {visibleBottles.map((bottleData) => (
            <FloatingBottle
              key={bottleData.id}
              bottle={bottleData}
              initialX={bottleData.position.x}
              initialY={bottleData.position.y}
              oceanWidth={oceanWidth}
              oceanHeight={oceanHeight}
              onClick={handleBottleClick}
              animationDelay={bottleData.animationDelay}
            />
          ))}
        </Layer>

        {/* Atmospheric depth overlay - follows viewport */}
        <Layer listening={false}>
          <Rect
            x={-stagePos.x}
            y={-stagePos.y}
            width={width}
            height={height}
            fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
            fillRadialGradientEndRadius={Math.max(width, height) * 0.8}
            fillRadialGradientColorStops={[
              0,
              'rgba(0, 0, 0, 0)',
              0.7,
              'rgba(0, 30, 50, 0.15)',
              1,
              'rgba(0, 20, 40, 0.35)',
            ]}
          />
        </Layer>
      </Stage>

      <BottleModal bottle={selectedBottle} onClose={handleCloseModal} />

      <CreateBottleButton onClick={() => setIsCreateModalOpen(true)} />
      <CreateBottleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleBottleCreated}
      />
    </>
  );
}
