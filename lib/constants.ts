export const OCEAN = {
  MIN_BOTTLE_SPACING: 100,
  EDGE_PADDING: 50,
} as const;

export const BOTTLE_PHYSICS = {
  DRIFT_SPEED_MIN: 40, // Increased from 20
  DRIFT_SPEED_MAX: 80, // Increased from 50
  DRIFT_DIRECTION_CHANGE_MIN: 3000, // Decreased from 5000 (faster direction changes)
  DRIFT_DIRECTION_CHANGE_MAX: 6000, // Decreased from 10000
  BOB_AMPLITUDE_MIN: 10,
  BOB_AMPLITUDE_MAX: 20,
  BOB_FREQUENCY_MIN: 1500, // Decreased from 2000 (faster bobbing)
  BOB_FREQUENCY_MAX: 2500, // Decreased from 3000
  MAX_ROTATION: 10,
  SPRING_TENSION: 50,
  SPRING_FRICTION: 20,
} as const;

export const BOTTLE_VISUAL = {
  WIDTH: 40,
  HEIGHT: 80,
  CORNER_RADIUS: 8,
  CAP_RADIUS: 15,
  CAP_OFFSET_Y: -10,
  BODY_COLOR: "rgba(150, 200, 220, 0.8)",
  CAP_COLOR: "rgba(139, 90, 60, 0.9)",
  OUTLINE_COLOR: "#2C5F7F",
  OUTLINE_WIDTH: 2,
  LABEL_FONT_SIZE: 12,
  LABEL_COLOR: "#2C3E50",
} as const;

export const OCEAN_COLORS = {
  SURFACE: "#87CEEB",
  DEEP: "#4682B4",
} as const;

export const UI_COLORS = {
  MODAL_BACKGROUND: "#FFFFFF",
  TEXT_PRIMARY: "#2C3E50",
  TEXT_SECONDARY: "#7F8C8D",
  ACCENT: "#FF6B6B",
  SHADOW: "rgba(0, 0, 0, 0.1)",
  BACKDROP: "rgba(0, 0, 0, 0.4)",
} as const;

export const PERFORMANCE = {
  MAX_VISIBLE_BOTTLES: 50,
  TARGET_FPS: 60,
} as const;
