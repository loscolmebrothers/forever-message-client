"use client";

import { useState, useMemo } from "react";
import { Stage, Layer } from "react-konva";
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
import { getRandomBottlePosition } from "@/lib/mock-data";
import { OCEAN } from "@/lib/constants";

export function OceanStage() {
  const { width, height } = useWindowSize();
  const { bottles, isLoading, error, isEmpty, mutate } = useBottles();
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Generate random initial positions for each bottle (stable across renders)
  const bottlePositions = useMemo(() => {
    if (width === 0 || height === 0) return [];

    return bottles.map(() =>
      getRandomBottlePosition(width, height, OCEAN.EDGE_PADDING),
    );
  }, [bottles, width, height]);

  const handleBottleClick = (bottle: Bottle) => {
    setSelectedBottle(bottle);
  };

  const handleCloseModal = () => {
    setSelectedBottle(null);
  };

  const handleBottleCreated = () => {
    mutate();
  };

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
      <Stage width={width} height={height}>
        <Layer listening={false}>
          <OceanBackground width={width} height={height} />
        </Layer>

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
