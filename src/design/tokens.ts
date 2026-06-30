/** Part 7 design tokens — 8pt grid, radius, shadows, motion */

export const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128] as const;

/** Max corner radius — sharp, professional UI */
export const RADIUS_PX = 6;

export const RADIUS = {
  button: RADIUS_PX,
  card: RADIUS_PX,
  input: RADIUS_PX,
  image: RADIUS_PX,
  dialog: RADIUS_PX,
  sheet: RADIUS_PX,
} as const;

export const SHADOW = {
  xs: "0 1px 2px rgba(0,0,0,0.04)",
  sm: "0 2px 8px rgba(0,0,0,0.06)",
  md: "0 4px 16px rgba(0,0,0,0.08)",
  lg: "0 8px 32px rgba(0,0,0,0.12)",
  xl: "0 16px 48px rgba(0,0,0,0.16)",
  glow: "0 0 24px rgba(var(--color-primary-rgb), 0.25)",
  premium: "0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.08)",
} as const;

export const MOTION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const ICON_SIZE = [16, 20, 24, 32, 40, 48] as const;
