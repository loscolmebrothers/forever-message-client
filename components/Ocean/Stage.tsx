"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useWindowSize } from "usehooks-ts";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { OceanBackground } from "./Background";
import { FloatingBottle } from "../Bottle/FloatingBottle";
import { BottleModal } from "../Bottle/BottleModal";
import { CreateBottleButton } from "../Bottle/CreateBottleButton";
import { CreateBottleModal } from "../Bottle/CreateBottleModal";
import { LOSCOLMEBROTHERSLogo } from "../LOSCOLMEBROTHERSLogo";
import { ErrorState } from "../ErrorState";
import { useBottles } from "@/hooks/useBottles";
import { getRandomBottlePosition } from "@/lib/bottle-utils";
import { OCEAN } from "@/lib/constants";
import type Konva from "konva";
import { BottleWithQueue } from "@/hooks/useBottleQueue";
import { useAuth } from "@/lib/auth/AuthContext";
import { useDailyLimit } from "@/hooks/useDailyLimit";

const OCEAN_SCALE = 5;

const CULLING_PADDING = 500;

interface BottleWithPosition extends BottleWithQueue {
  position: { x: number; y: number };
  animationDelay: number;
}

export function OceanStage() {
  const { width, height } = useWindowSize();
  const { bottles, isLoading, error, mutate, loadMore, loadingProgress } =
    useBottles();
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const loadMoreTriggeredRef = useRef(false);
  const [exitingBottles, setExitingBottles] = useState<Set<number | string>>(
    new Set()
  );
  const previousVisibleIdsRef = useRef<Set<number | string>>(new Set());

  const { address } = useAuth();
  const userId = address || null;
  const {
    status: limitStatus,
    timeUntilReset,
    refetch: refetchLimit,
  } = useDailyLimit(userId);

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

  // Auto-load more bottles when user has explored most of the loaded area
  useEffect(() => {
    if (
      !loadingProgress.isFullyLoaded &&
      !loadingProgress.isFetchingMore &&
      visibleBottles.length < 10 && // Few bottles visible
      bottles.length > 0 && // Not initial load
      !loadMoreTriggeredRef.current
    ) {
      loadMoreTriggeredRef.current = true;
      loadMore().finally(() => {
        loadMoreTriggeredRef.current = false;
      });
    }
  }, [visibleBottles.length, bottles.length, loadingProgress, loadMore]);

  // Track bottles exiting viewport and trigger fade-out animation
  useEffect(() => {
    const currentVisibleIds = new Set(
      visibleBottles.map((b) => b.queueId || b.id)
    );

    // Find bottles that were visible but are no longer visible
    const exitingIds = Array.from(previousVisibleIdsRef.current).filter(
      (id) => !currentVisibleIds.has(id)
    );

    if (exitingIds.length > 0) {
      setExitingBottles((prev) => {
        const newSet = new Set(prev);
        exitingIds.forEach((id) => newSet.add(id));
        return newSet;
      });

      // Remove from exiting set after animation completes (300ms)
      setTimeout(() => {
        setExitingBottles((prev) => {
          const newSet = new Set(prev);
          exitingIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }, 300);
    }

    previousVisibleIdsRef.current = currentVisibleIds;
  }, [visibleBottles]);

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
    refetchLimit();
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
        className="w-full h-screen overflow-hidden bg-[#1a3d5c]"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
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

          {/* Bottles layer - render visible + exiting bottles */}
          <Layer>
            {bottlesWithPositions.map((bottleData) => {
              const bottleId = bottleData.queueId || bottleData.id;
              const isVisible = visibleBottles.some(
                (vb) => (vb.queueId || vb.id) === bottleId
              );
              const isExiting = exitingBottles.has(bottleId);

              // Only render if visible or currently exiting
              if (!isVisible && !isExiting) return null;

              return (
                <FloatingBottle
                  key={bottleId}
                  bottle={bottleData}
                  initialX={bottleData.position.x}
                  initialY={bottleData.position.y}
                  oceanWidth={oceanWidth}
                  oceanHeight={oceanHeight}
                  onClick={handleBottleClick}
                  animationDelay={bottleData.animationDelay}
                  isExiting={isExiting}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>

      <BottleModal
        bottle={selectedBottle}
        onClose={handleCloseModal}
        onBottleBecameForever={mutate}
      />

      <CreateBottleButton
        onClick={() => setIsCreateModalOpen(true)}
        limitStatus={limitStatus}
        timeUntilReset={timeUntilReset}
      />
      <LOSCOLMEBROTHERSLogo />
      <CreateBottleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          refetchLimit(); // Refetch limit whenever modal closes (success or error)
        }}
        onSuccess={handleBottleCreated}
      />
    </>
  );
}
