// Game configuration constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // Grid settings
  GRID_SIZE: 20,
  GRID_WIDTH: 40, // 800 / 20
  GRID_HEIGHT: 30, // 600 / 20

  // Game mechanics
  BASE_SPEED: 6, // Frames per movement
  SPEED_INCREASE: 0.8, // Speed multiplier per level
  MIN_SPEED: 2, // Minimum frames per movement

  // Power-ups
  POWER_UP_CHANCE: 0.008, // Chance per frame to spawn
  POWER_UP_DURATION: 300, // Frames (5 seconds at 60fps)
  POWER_UP_SPEED_MULTIPLIER: 2,

  // Combo system
  COMBO_WINDOW: 1800, // 30 seconds at 60fps
  COMBO_THRESHOLD: 5, // Foods to trigger combo
  COMBO_BONUS_MULTIPLIER: 10,

  // Visual effects
  PARTICLE_COUNT: 18,
  PARTICLE_COMBO_COUNT: 48,
  PARTICLE_LIFETIME: 40,

  // Scoring
  FOOD_POINTS: 10,
  LEVEL_UP_THRESHOLD: 100, // Points per level

  // UI
  UI_PADDING: 20,
  POPUP_DURATION: 180, // 3 seconds at 60fps

  // Mobile optimization
  TOUCH_THRESHOLD: 30, // Minimum swipe distance

  // Performance
  MAX_PARTICLES: 500,
  PARTICLE_POOL_SIZE: 100,
} as const;

// Color schemes for different themes
export const COLOR_PALETTES = {
  DARK: {
    background: 0x0a0a0a,
    primary: 0x00ff88,
    secondary: 0xff4466,
    accent: 0x3399ff,
    particle: 0xffe066,
    text: '#ffffff',
    grid: 0x1a1a1a,
  },
  LIGHT: {
    background: 0xf5f5f5,
    primary: 0x228833,
    secondary: 0xdd2222,
    accent: 0x2277cc,
    particle: 0xffc300,
    text: '#222222',
    grid: 0xe0e0e0,
  },
  RETRO: {
    background: 0x000033,
    primary: 0x00ffff,
    secondary: 0xff00ff,
    accent: 0xffff00,
    particle: 0x00ffff,
    text: '#00ffff',
    grid: 0x001122,
  },
  NEON: {
    background: 0x0d0d0d,
    primary: 0x39ff14,
    secondary: 0xff073a,
    accent: 0x00d4ff,
    particle: 0xffff00,
    text: '#39ff14',
    grid: 0x1a0d1a,
  },
  SUNSET: {
    background: 0x2d1b69,
    primary: 0xff6b35,
    secondary: 0xf7931e,
    accent: 0xffd23f,
    particle: 0xff9999,
    text: '#ffd23f',
    grid: 0x3d2b79,
  },
} as const;

// Game modes
export const GAME_MODES = {
  CLASSIC: 'classic',
  TIME_ATTACK: 'time_attack',
  OBSTACLE_COURSE: 'obstacle_course',
  SURVIVAL: 'survival',
  SPEED_RUN: 'speed_run',
} as const;

// Input mappings
export const CONTROLS = {
  UP: [ 'ArrowUp', 'KeyW' ],
  DOWN: [ 'ArrowDown', 'KeyS' ],
  LEFT: [ 'ArrowLeft', 'KeyA' ],
  RIGHT: [ 'ArrowRight', 'KeyD' ],
  PAUSE: [ 'Space', 'KeyP' ],
  RESTART: [ 'KeyR' ],
  THEME_TOGGLE: [ 'KeyT' ],
  SKIN_TOGGLE: [ 'KeyS' ],
  MODE_TOGGLE: [ 'KeyM' ],
} as const;

export type ColorPalette = typeof COLOR_PALETTES[ keyof typeof COLOR_PALETTES ];
export type GameMode = typeof GAME_MODES[ keyof typeof GAME_MODES ]; 