/**
 * Utility functions for bottle positioning and animation
 */

/**
 * Get random initial position for a bottle
 * Ensures bottles are within ocean bounds with padding
 */
export function getRandomBottlePosition(
  oceanWidth: number,
  oceanHeight: number,
  padding: number = 50,
): { x: number; y: number } {
  return {
    x: padding + Math.random() * (oceanWidth - 2 * padding),
    y: padding + Math.random() * (oceanHeight - 2 * padding),
  };
}

/**
 * Get random velocity for drift
 */
export function getRandomVelocity(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Get random phase offset for bobbing (prevents sync)
 */
export function getRandomPhase(): number {
  return Math.random() * Math.PI * 2;
}
