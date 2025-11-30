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
import { ErrorState } from "./ErrorState";
import { useBottles } from "@/hooks/useBottles";
import { getRandomBottlePosition } from "@/lib/bottle-utils";
import { OCEAN } from "@/lib/constants";
import type Konva from "konva";
import { BottleWithQueue } from "@/hooks/useBottleQueue";
import { useAuth } from "@/lib/auth/AuthContext";

const OCEAN_SCALE = 5;

const CULLING_PADDING = 500;

interface BottleWithPosition extends BottleWithQueue {
  position: { x: number; y: number };
  animationDelay: number;
}

export function OceanStage() {
  const { width, height } = useWindowSize();
  const { bottles, isLoading, error, isEmpty, mutate } = useBottles();
  const { isAuthenticated } = useAuth();
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  const bottlePositionsRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );

  const oceanWidth = width * OCEAN_SCALE;
  const oceanHeight = height * OCEAN_SCALE;

  const bottlesWithPositions = useMemo<BottleWithPosition[]>(() => {
    if (width === 0 || height === 0) return [];

    return bottles.map((bottle, index) => {
      let position = bottlePositionsRef.current.get(bottle.id);

      if (!position) {
        position = getRandomBottlePosition(
          oceanWidth,
          oceanHeight,
          OCEAN.EDGE_PADDING
        );
        bottlePositionsRef.current.set(bottle.id, position);
      }

      return {
        ...bottle,
        position,
        animationDelay: index * 50,
      };
    });
  }, [bottles, oceanWidth, oceanHeight, height, width]);

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
    setTimeout(() => {
      mutate();
    }, 2000);
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target as Konva.Stage;
      const newPos = stage.position();

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
    },
    [oceanWidth, oceanHeight, width, height]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const scrollSpeed = 1;
      const dx = e.evt.deltaX * scrollSpeed;
      const dy = e.evt.deltaY * scrollSpeed;

      const newPos = {
        x: stagePos.x - dx,
        y: stagePos.y - dy,
      };

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
    },
    [stagePos, oceanWidth, oceanHeight, width, height]
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (width === 0 || height === 0) {
    return null;
  }

  return (
    <>
      <div
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#1a3d5c",
        }}
      >
        <Stage
          width={width}
          height={height}
          draggable
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
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
                key={bottleData.queueId || bottleData.id}
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
                "rgba(0, 0, 0, 0)",
                0.7,
                "rgba(0, 30, 50, 0.15)",
                1,
                "rgba(0, 20, 40, 0.35)",
              ]}
            />
          </Layer>
        </Stage>
      </div>

      <BottleModal bottle={selectedBottle} onClose={handleCloseModal} />

      <CreateBottleButton
        onClick={() => setIsCreateModalOpen(true)}
        isAuthenticated={isAuthenticated}
      />
      <CreateBottleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleBottleCreated}
      />
    </>
  );
}
