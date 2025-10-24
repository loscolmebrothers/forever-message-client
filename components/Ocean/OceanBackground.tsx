'use client'

import { Rect } from 'react-konva'

interface OceanBackgroundProps {
  width: number
  height: number
}

/**
 * Blue gradient ocean background
 * Fills the entire canvas with a peaceful ocean gradient
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
        1,
        '#4682B4', // Steel Blue (bottom/deep)
      ]}
    />
  )
}
