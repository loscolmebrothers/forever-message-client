'use client'

import { useEffect, useRef } from 'react'
import { Rect, Circle, Group } from 'react-konva'
import { useFrame } from '@/hooks/useFrame'

interface OceanBackgroundProps {
  width: number
  height: number
}

interface Bubble {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
}

/**
 * Ultra-simple ocean background - just gradient and basic bubbles for performance
 */
export function OceanBackground({ width, height }: OceanBackgroundProps) {
  const bubblesRef = useRef<Bubble[]>([])

  // Initialize bubbles - fewer for performance
  useEffect(() => {
    const area = width * height
    const bubbleCount = Math.floor(area / 80000) // Reduced from 50k - fewer bubbles

    bubblesRef.current = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 2 + Math.random() * 3, // Smaller
      speed: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.3,
    }))
  }, [width, height])

  // Simple animation loop - just move bubbles
  useFrame(() => {
    bubblesRef.current = bubblesRef.current.map((bubble) => {
      const newY = bubble.y - bubble.speed

      // Reset bubble when it goes off screen
      if (newY < -50) {
        return {
          ...bubble,
          y: height + 50,
          x: Math.random() * width,
        }
      }

      return {
        ...bubble,
        y: newY,
      }
    })
  })

  return (
    <Group>
      {/* Static gradient background - no animation for performance */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height }}
        fillLinearGradientColorStops={[
          0,
          '#87CEEB',
          0.15,
          '#6bb3e0',
          0.35,
          '#4a9fd6',
          0.55,
          '#3d7ba8',
          0.75,
          '#2a5a7f',
          1,
          '#1a3d5c',
        ]}
      />

      {/* Simple bubbles - no gradients, just solid for performance */}
      {bubblesRef.current.map((bubble, i) => (
        <Circle
          key={`bubble-${i}`}
          x={bubble.x}
          y={bubble.y}
          radius={bubble.radius}
          fill={`rgba(255, 255, 255, ${bubble.opacity})`}
        />
      ))}
    </Group>
  )
}
