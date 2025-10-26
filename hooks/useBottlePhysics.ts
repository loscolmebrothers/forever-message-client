import { useState, useEffect, useRef } from 'react';
import { useSpring } from '@react-spring/konva';
import { BOTTLE_PHYSICS } from '@/lib/constants';

interface BottlePhysicsProps {
  initialX: number;
  initialY: number;
  oceanWidth: number;
  oceanHeight: number;
  bottleWidth: number;
}

interface BottlePhysicsReturn {
  x: number;
  y: number;
  rotation: number;
}

/**
 * Custom hook for bottle physics and animation
 * Handles horizontal drift and vertical bobbing with spring-based animations
 */
export function useBottlePhysics({
  initialX,
  initialY,
  oceanWidth,
  oceanHeight,
  bottleWidth,
}: BottlePhysicsProps): BottlePhysicsReturn {
  // Random initial parameters
  const [params] = useState(() => ({
    driftSpeed: BOTTLE_PHYSICS.DRIFT_SPEED_MIN +
      Math.random() * (BOTTLE_PHYSICS.DRIFT_SPEED_MAX - BOTTLE_PHYSICS.DRIFT_SPEED_MIN),
    bobAmplitude: BOTTLE_PHYSICS.BOB_AMPLITUDE_MIN +
      Math.random() * (BOTTLE_PHYSICS.BOB_AMPLITUDE_MAX - BOTTLE_PHYSICS.BOB_AMPLITUDE_MIN),
    bobFrequency: BOTTLE_PHYSICS.BOB_FREQUENCY_MIN +
      Math.random() * (BOTTLE_PHYSICS.BOB_FREQUENCY_MAX - BOTTLE_PHYSICS.BOB_FREQUENCY_MIN),
    phase: Math.random() * Math.PI * 2, // Random phase for bobbing
    initialDirection: Math.random() > 0.5 ? 1 : -1, // Random initial direction
  }));

  // Drift state
  const [direction, setDirection] = useState(params.initialDirection);
  const [targetX, setTargetX] = useState(initialX);
  const baseYRef = useRef(initialY);

  // Spring animation for smooth movement
  const [springProps, api] = useSpring(() => ({
    x: initialX,
    y: initialY,
    rotation: 0,
    config: {
      tension: BOTTLE_PHYSICS.SPRING_TENSION,
      friction: BOTTLE_PHYSICS.SPRING_FRICTION,
    },
  }));

  // Handle horizontal drift with boundary detection
  useEffect(() => {
    const updateDrift = () => {
      const speed = params.driftSpeed / 60; // Convert to px per frame (60 FPS)
      let newTargetX = targetX + (direction * speed);

      // Boundary detection - reverse direction at edges
      if (newTargetX <= bottleWidth / 2) {
        newTargetX = bottleWidth / 2;
        setDirection(1);
      } else if (newTargetX >= oceanWidth - bottleWidth / 2) {
        newTargetX = oceanWidth - bottleWidth / 2;
        setDirection(-1);
      }

      setTargetX(newTargetX);

      // Update rotation based on direction (subtle tilt)
      const rotationAngle = direction * (BOTTLE_PHYSICS.MAX_ROTATION / 2);

      api.start({
        x: newTargetX,
        rotation: rotationAngle,
      });
    };

    const driftInterval = setInterval(updateDrift, 1000 / 60); // 60 FPS

    return () => clearInterval(driftInterval);
  }, [targetX, direction, oceanWidth, bottleWidth, params.driftSpeed, api]);

  // Random direction changes
  useEffect(() => {
    const changeDirection = () => {
      // Randomly decide to change direction
      if (Math.random() > 0.5) {
        setDirection((prev) => -prev);
      }
    };

    const minInterval = BOTTLE_PHYSICS.DRIFT_DIRECTION_CHANGE_MIN;
    const maxInterval = BOTTLE_PHYSICS.DRIFT_DIRECTION_CHANGE_MAX;
    const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);

    const directionTimeout = setTimeout(changeDirection, randomInterval);

    return () => clearTimeout(directionTimeout);
  }, [direction]);

  // Handle vertical bobbing (sine wave)
  useEffect(() => {
    const updateBob = () => {
      const time = Date.now();
      const bobOffset = Math.sin((time / params.bobFrequency) * Math.PI * 2 + params.phase) * params.bobAmplitude;

      api.start({
        y: baseYRef.current + bobOffset,
      });
    };

    const bobInterval = setInterval(updateBob, 1000 / 60); // 60 FPS

    return () => clearInterval(bobInterval);
  }, [params.bobFrequency, params.bobAmplitude, params.phase, api]);

  return {
    x: springProps.x.get(),
    y: springProps.y.get(),
    rotation: springProps.rotation.get(),
  };
}
