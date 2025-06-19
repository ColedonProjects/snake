export interface SnakeGameConfig
{
  // Container element or selector where the game will be injected
  container?: HTMLElement | string;

  // Key sequence to trigger the game (default: Konami Code)
  keySequence?: KeySequence;

  // Custom styling options
  width?: number;
  height?: number;
  zIndex?: number;

  // Game behavior options
  autoStart?: boolean;
  closeOnEscape?: boolean;
  showInstructions?: boolean;

  // Callback functions
  onGameOpen?: () => void;
  onGameClose?: () => void;
  onHighScore?: ( score: number ) => void;
}

export interface KeySequence
{
  keys: string[];
  timeWindow?: number; // Time window in ms to complete sequence (default: 3000)
  caseSensitive?: boolean;
}

// Predefined key sequences
export const KONAMI_CODE: KeySequence = {
  keys: [ 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA' ],
  timeWindow: 3000,
  caseSensitive: false
};

export const SNAKE_SEQUENCE: KeySequence = {
  keys: [ 'KeyS', 'KeyN', 'KeyA', 'KeyK', 'KeyE' ],
  timeWindow: 2000,
  caseSensitive: false
};

export const DEBUG_SEQUENCE: KeySequence = {
  keys: [ 'KeyD', 'KeyE', 'KeyV' ],
  timeWindow: 1500,
  caseSensitive: false
}; 