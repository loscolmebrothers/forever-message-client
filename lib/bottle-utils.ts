export function getRandomBottlePosition(
  oceanWidth: number,
  oceanHeight: number,
  padding: number = 50
): { x: number; y: number } {
  return {
    x: padding + Math.random() * (oceanWidth - 2 * padding),
    y: padding + Math.random() * (oceanHeight - 2 * padding),
  };
}

export function getRandomVelocity(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function getRandomPhase(): number {
  return Math.random() * Math.PI * 2;
}
