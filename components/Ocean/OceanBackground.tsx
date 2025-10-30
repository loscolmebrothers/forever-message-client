'use client'

import { Rect } from 'react-konva'

interface OceanBackgroundProps {
  width: number
  height: number
}

/**
 * Simple ocean background with gradient
 */
export function OceanBackground({ width, height }: OceanBackgroundProps) {
  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
      fillLinearGradientEndPoint={{ x: 0, y: height }}
      fillLinearGradientColorStops={[
        0,
        '#87CEEB', // Sky Blue (top)
        0.3,
        '#5fa3d0', // Light ocean blue
        0.7,
        '#3d7ba8', // Medium ocean blue
        1,
        '#1e4d7a', // Deep ocean blue (bottom)
      ]}
    />
  )
}
