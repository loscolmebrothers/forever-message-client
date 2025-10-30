'use client'

import { useEffect, useRef, useState } from 'react'
import { Rect, Line, Circle, Group } from 'react-konva'
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
  wobble: number
  wobbleSpeed: number
}

interface LightRay {
  x: number
  width: number
  speed: number
  offset: number
}

/**
 * Artistic ocean background with animated waves, light rays, and particles
 */
export function OceanBackground({ width, height }: OceanBackgroundProps) {
  const [time, setTime] = useState(0)
  const bubblesRef = useRef<Bubble[]>([])
  const lightRaysRef = useRef<LightRay[]>([])

  // Initialize bubbles
  useEffect(() => {
    bubblesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 200,
      radius: 2 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.7,
      opacity: 0.1 + Math.random() * 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    }))

    // Initialize light rays
    lightRaysRef.current = Array.from({ length: 8 }, (_, i) => ({
      x: (width / 9) * (i + 0.5),
      width: 40 + Math.random() * 60,
      speed: 0.0003 + Math.random() * 0.0005,
      offset: Math.random() * Math.PI * 2,
    }))
  }, [width, height])

  // Animation loop
  useFrame(() => {
    setTime((t) => t + 0.016)

    // Update bubbles
    bubblesRef.current = bubblesRef.current.map((bubble) => {
      const newY = bubble.y - bubble.speed
      const newWobble = bubble.wobble + bubble.wobbleSpeed

      // Reset bubble when it goes off screen
      if (newY < -50) {
        return {
          ...bubble,
          y: height + 50,
          x: Math.random() * width,
          wobble: newWobble,
        }
      }

      return {
        ...bubble,
        y: newY,
        wobble: newWobble,
      }
    })
  })

  // Generate wave points
  const generateWavePoints = (
    waveOffset: number,
    amplitude: number,
    frequency: number,
    yPosition: number
  ) => {
    const points: number[] = []
    const segments = 100

    for (let i = 0; i <= segments; i++) {
      const x = (width / segments) * i
      const y = yPosition + Math.sin((x * frequency + waveOffset) * 0.01) * amplitude
      points.push(x, y)
    }

    return points
  }

  // Generate light ray polygon points
  const generateLightRayPoints = (ray: LightRay) => {
    const startX = ray.x
    const startY = 0
    const endX = startX + Math.sin(time * ray.speed + ray.offset) * 100
    const endY = height
    const halfWidth = ray.width / 2

    return [
      startX - halfWidth * 0.3, startY,
      startX + halfWidth * 0.3, startY,
      endX + halfWidth, endY,
      endX - halfWidth, endY,
    ]
  }

  return (
    <Group>
      {/* Base gradient background with slight animation */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height }}
        fillLinearGradientColorStops={[
          0,
          `rgb(${135 + Math.sin(time * 0.1) * 10}, ${206 + Math.sin(time * 0.15) * 10}, ${235 + Math.sin(time * 0.12) * 10})`,
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

      {/* Light rays (god rays / caustics) */}
      {lightRaysRef.current.map((ray, i) => (
        <Line
          key={`ray-${i}`}
          points={generateLightRayPoints(ray)}
          fill={`rgba(255, 255, 255, ${0.03 + Math.sin(time * 0.5 + ray.offset) * 0.02})`}
          closed
        />
      ))}

      {/* Wave layer 3 (deepest, slowest) */}
      <Line
        points={[
          ...generateWavePoints(time * 15, 40, 0.3, height * 0.7),
          width, height,
          0, height,
        ]}
        fill="rgba(26, 61, 92, 0.3)"
        closed
      />

      {/* Wave layer 2 (middle) */}
      <Line
        points={[
          ...generateWavePoints(time * 25, 30, 0.5, height * 0.5),
          width, height,
          0, height,
        ]}
        fill="rgba(42, 90, 127, 0.25)"
        closed
      />

      {/* Wave layer 1 (surface, fastest) */}
      <Line
        points={[
          ...generateWavePoints(time * 40, 25, 0.8, height * 0.15),
          width, height,
          0, height,
        ]}
        fill="rgba(107, 179, 224, 0.2)"
        closed
      />

      {/* Bubbles */}
      {bubblesRef.current.map((bubble, i) => {
        const wobbleX = Math.sin(bubble.wobble) * 15
        return (
          <Circle
            key={`bubble-${i}`}
            x={bubble.x + wobbleX}
            y={bubble.y}
            radius={bubble.radius}
            fill={`rgba(255, 255, 255, ${bubble.opacity})`}
            stroke={`rgba(255, 255, 255, ${bubble.opacity * 0.5})`}
            strokeWidth={0.5}
          />
        )
      })}

      {/* Ambient light particles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (width / 50) * i + Math.sin(time * 0.5 + i * 0.5) * 20
        const y = (height / 50) * ((i * 37) % 50) + Math.cos(time * 0.3 + i * 0.3) * 15
        const opacity = 0.1 + Math.sin(time * 2 + i) * 0.1

        return (
          <Circle
            key={`particle-${i}`}
            x={x}
            y={y}
            radius={1}
            fill={`rgba(255, 255, 255, ${Math.max(0, opacity)})`}
          />
        )
      })}

      {/* Surface shimmer */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height * 0.3}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height * 0.3 }}
        fillLinearGradientColorStops={[
          0,
          `rgba(255, 255, 255, ${0.1 + Math.sin(time * 0.5) * 0.05})`,
          0.5,
          'rgba(255, 255, 255, 0.02)',
          1,
          'rgba(255, 255, 255, 0)',
        ]}
      />
    </Group>
  )
}
