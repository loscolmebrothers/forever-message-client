"use client";

import { useState, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import { useWindowSize } from "usehooks-ts";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { OceanBackground } from "./OceanBackground";
import { FloatingBottle } from "./FloatingBottle";
import { BottleModal } from "./BottleModal";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { useBottles } from "@/hooks/useBottles";
import { getRandomBottlePosition } from "@/lib/mock-data";
import { OCEAN } from "@/lib/constants";

/**
 * Main Konva Stage container for the ocean scene
 * Renders a full-screen canvas with the ocean background and floating bottles
 */
export function OceanStage() {
  const { width, height } = useWindowSize();
  const { bottles, isLoading, error, isEmpty } = useBottles();
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);

  // Generate random initial positions for each bottle (stable across renders)
  const bottlePositions = useMemo(() => {
    if (width === 0 || height === 0) return [];

    return bottles.map(() =>
      getRandomBottlePosition(width, height, OCEAN.EDGE_PADDING),
    );
  }, [bottles, width, height]);

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Show empty state
  if (isEmpty) {
    return <EmptyState />;
  }

  // Don't render until we have valid dimensions
  if (width === 0 || height === 0) {
    return null;
  }

  const handleBottleClick = (bottle: Bottle) => {
    setSelectedBottle(bottle);
  };

  const handleCloseModal = () => {
    setSelectedBottle(null);
  };

  return (
    <>
      <Stage width={width} height={height}>
        {/* Background Layer - cached for performance */}
        <Layer listening={false}>
          <OceanBackground width={width} height={height} />
        </Layer>

        {/* Bottles Layer */}
        <Layer>
          {bottles.map((bottle, index) => (
            <FloatingBottle
              key={bottle.id}
              bottle={bottle}
              initialX={bottlePositions[index]?.x || width / 2}
              initialY={bottlePositions[index]?.y || height / 2}
              oceanWidth={width}
              oceanHeight={height}
              onClick={handleBottleClick}
            />
          ))}
        </Layer>
      </Stage>

      {/* Message Modal */}
      <BottleModal bottle={selectedBottle} onClose={handleCloseModal} />
    </>
  );
}
