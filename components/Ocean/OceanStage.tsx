"use client";

import { Stage, Layer } from "react-konva";
import { useWindowSize } from "usehooks-ts";
import { OceanBackground } from "./OceanBackground";

/**
 * Main Konva Stage container for the ocean scene
 * Renders a full-screen canvas with the ocean background
 */
export function OceanStage() {
  const { width, height } = useWindowSize();

  // Don't render until we have valid dimensions
  if (width === 0 || height === 0) {
    return null;
  }

  return (
    <Stage width={width} height={height}>
      {/* Background Layer - cached for performance */}
      <Layer listening={false}>
        <OceanBackground width={width} height={height} />
      </Layer>

      {/* Bottles Layer - will be added in Step 4 */}
      <Layer>{/* Floating bottles will go here */}</Layer>
    </Stage>
  );
}
