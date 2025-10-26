/**
 * Constants for the Forever Message ocean scene
 * Animation speeds, physics parameters, colors, etc.
 */

// Ocean dimensions and layout
export const OCEAN = {
  // Minimum spacing between bottles at initialization
  MIN_BOTTLE_SPACING: 100,

  // Padding from edges
  EDGE_PADDING: 50,
} as const;

// Bottle physics and animation
export const BOTTLE_PHYSICS = {
  // Horizontal drift
  DRIFT_SPEED_MIN: 20, // px/second
  DRIFT_SPEED_MAX: 50, // px/second
  DRIFT_DIRECTION_CHANGE_MIN: 5000, // milliseconds
  DRIFT_DIRECTION_CHANGE_MAX: 10000, // milliseconds

  // Vertical bobbing
  BOB_AMPLITUDE_MIN: 10, // pixels
  BOB_AMPLITUDE_MAX: 20, // pixels
  BOB_FREQUENCY_MIN: 2000, // milliseconds per cycle
  BOB_FREQUENCY_MAX: 3000, // milliseconds per cycle

  // Rotation (optional)
  MAX_ROTATION: 10, // degrees

  // Spring animation config
  SPRING_TENSION: 50,
  SPRING_FRICTION: 20,
} as const;

// Bottle visual properties
export const BOTTLE_VISUAL = {
  WIDTH: 40,
  HEIGHT: 80,
  CORNER_RADIUS: 8,

  // Cap/cork
  CAP_RADIUS: 15,
  CAP_OFFSET_Y: -10, // Relative to bottle top

  // Colors
  BODY_COLOR: 'rgba(150, 200, 220, 0.8)',
  CAP_COLOR: 'rgba(139, 90, 60, 0.9)',
  OUTLINE_COLOR: '#2C5F7F',
  OUTLINE_WIDTH: 2,

  // Label
  LABEL_FONT_SIZE: 12,
  LABEL_COLOR: '#2C3E50',
} as const;

// Ocean colors
export const OCEAN_COLORS = {
  SURFACE: '#87CEEB', // Sky Blue
  DEEP: '#4682B4', // Steel Blue
} as const;

// UI colors
export const UI_COLORS = {
  MODAL_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#2C3E50',
  TEXT_SECONDARY: '#7F8C8D',
  ACCENT: '#FF6B6B',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
  BACKDROP: 'rgba(0, 0, 0, 0.4)',
} as const;

// Performance
export const PERFORMANCE = {
  // Max bottles to render (future)
  MAX_VISIBLE_BOTTLES: 50,

  // Animation frame rate target
  TARGET_FPS: 60,
} as const;
