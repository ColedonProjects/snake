import { GAME_CONFIG } from './constants';

// Position utility interface
export interface Position
{
  x: number;
  y: number;
}

// Direction enum
export enum Direction
{
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

// Grid utilities
export const GridUtils = {
  // Convert pixel coordinates to grid coordinates
  pixelToGrid: ( x: number, y: number ): Position => ( {
    x: Math.floor( x / GAME_CONFIG.GRID_SIZE ),
    y: Math.floor( y / GAME_CONFIG.GRID_SIZE ),
  } ),

  // Convert grid coordinates to pixel coordinates
  gridToPixel: ( x: number, y: number ): Position => ( {
    x: x * GAME_CONFIG.GRID_SIZE,
    y: y * GAME_CONFIG.GRID_SIZE,
  } ),

  // Check if position is within grid bounds
  isValidPosition: ( x: number, y: number ): boolean =>
  {
    return x >= 0 && x < GAME_CONFIG.GRID_WIDTH && y >= 0 && y < GAME_CONFIG.GRID_HEIGHT;
  },

  // Get random grid position
  getRandomPosition: (): Position => ( {
    x: Math.floor( Math.random() * GAME_CONFIG.GRID_WIDTH ),
    y: Math.floor( Math.random() * GAME_CONFIG.GRID_HEIGHT ),
  } ),

  // Get safe random position (avoiding given positions)
  getSafeRandomPosition: ( avoidPositions: Position[] ): Position =>
  {
    let attempts = 0;
    let position: Position;

    do
    {
      position = GridUtils.getRandomPosition();
      attempts++;

      // Fallback to any position if too many attempts
      if ( attempts > 100 ) break;
    } while (
      avoidPositions.some( pos => pos.x === position.x && pos.y === position.y )
    );

    return position;
  },
};

// Math utilities
export const MathUtils = {
  // Linear interpolation
  lerp: ( start: number, end: number, t: number ): number =>
  {
    return start + ( end - start ) * t;
  },

  // Ease in-out function
  easeInOut: ( t: number ): number =>
  {
    return t < 0.5 ? 2 * t * t : -1 + ( 4 - 2 * t ) * t;
  },

  // Clamp value between min and max
  clamp: ( value: number, min: number, max: number ): number =>
  {
    return Math.min( Math.max( value, min ), max );
  },

  // Distance between two points
  distance: ( a: Position, b: Position ): number =>
  {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt( dx * dx + dy * dy );
  },

  // Random number in range
  randomRange: ( min: number, max: number ): number =>
  {
    return Math.random() * ( max - min ) + min;
  },

  // Random integer in range
  randomInt: ( min: number, max: number ): number =>
  {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
  },
};

// Color utilities
export const ColorUtils = {
  // Convert hex to RGB
  hexToRgb: ( hex: number ): { r: number; g: number; b: number; } =>
  {
    return {
      r: ( hex >> 16 ) & 255,
      g: ( hex >> 8 ) & 255,
      b: hex & 255,
    };
  },

  // Convert RGB to hex
  rgbToHex: ( r: number, g: number, b: number ): number =>
  {
    return ( r << 16 ) | ( g << 8 ) | b;
  },

  // Blend two colors
  blendColors: ( color1: number, color2: number, t: number ): number =>
  {
    const rgb1 = ColorUtils.hexToRgb( color1 );
    const rgb2 = ColorUtils.hexToRgb( color2 );

    return ColorUtils.rgbToHex(
      Math.round( MathUtils.lerp( rgb1.r, rgb2.r, t ) ),
      Math.round( MathUtils.lerp( rgb1.g, rgb2.g, t ) ),
      Math.round( MathUtils.lerp( rgb1.b, rgb2.b, t ) )
    );
  },

  // Generate random color
  randomColor: (): number =>
  {
    return Math.floor( Math.random() * 0xFFFFFF );
  },

  // Darken color
  darken: ( color: number, factor: number ): number =>
  {
    const rgb = ColorUtils.hexToRgb( color );
    return ColorUtils.rgbToHex(
      Math.round( rgb.r * ( 1 - factor ) ),
      Math.round( rgb.g * ( 1 - factor ) ),
      Math.round( rgb.b * ( 1 - factor ) )
    );
  },

  // Lighten color
  lighten: ( color: number, factor: number ): number =>
  {
    const rgb = ColorUtils.hexToRgb( color );
    return ColorUtils.rgbToHex(
      Math.min( 255, Math.round( rgb.r + ( 255 - rgb.r ) * factor ) ),
      Math.min( 255, Math.round( rgb.g + ( 255 - rgb.g ) * factor ) ),
      Math.min( 255, Math.round( rgb.b + ( 255 - rgb.b ) * factor ) )
    );
  },
};

// Animation utilities
export const AnimationUtils = {
  // Create smooth movement animation
  createSmoothMovement: ( start: Position, end: Position, duration: number ) =>
  {
    let elapsed = 0;

    return {
      update: ( delta: number ): Position =>
      {
        elapsed += delta;
        const t = MathUtils.clamp( elapsed / duration, 0, 1 );
        const easedT = MathUtils.easeInOut( t );

        return {
          x: MathUtils.lerp( start.x, end.x, easedT ),
          y: MathUtils.lerp( start.y, end.y, easedT ),
        };
      },
      isComplete: (): boolean => elapsed >= duration,
    };
  },

  // Create pulsing effect
  createPulse: ( baseValue: number, amplitude: number, frequency: number ) =>
  {
    let time = 0;

    return {
      update: ( delta: number ): number =>
      {
        time += delta;
        return baseValue + Math.sin( time * frequency ) * amplitude;
      },
    };
  },

  // Create shake effect
  createShake: ( intensity: number, duration: number ) =>
  {
    let elapsed = 0;

    return {
      update: ( delta: number ): Position =>
      {
        elapsed += delta;
        const t = MathUtils.clamp( elapsed / duration, 0, 1 );
        const currentIntensity = intensity * ( 1 - t );

        return {
          x: ( Math.random() - 0.5 ) * currentIntensity,
          y: ( Math.random() - 0.5 ) * currentIntensity,
        };
      },
      isComplete: (): boolean => elapsed >= duration,
    };
  },
};

// Touch/gesture utilities for mobile
export const TouchUtils = {
  // Detect swipe direction
  getSwipeDirection: ( startPos: Position, endPos: Position ): Direction | null =>
  {
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt( dx * dx + dy * dy );

    // Check if swipe is long enough
    if ( distance < GAME_CONFIG.TOUCH_THRESHOLD )
    {
      return null;
    }

    // Determine primary direction
    if ( Math.abs( dx ) > Math.abs( dy ) )
    {
      return dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else
    {
      return dy > 0 ? Direction.DOWN : Direction.UP;
    }
  },

  // Check if device is mobile
  isMobile: (): boolean =>
  {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent );
  },

  // Check if device supports touch
  hasTouch: (): boolean =>
  {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
};

// Performance utilities
export const PerformanceUtils = {
  // Object pool for efficient memory management
  createObjectPool: <T> ( createFn: () => T, resetFn: ( obj: T ) => void, initialSize: number = 10 ) =>
  {
    const pool: T[] = [];

    // Pre-populate pool
    for ( let i = 0; i < initialSize; i++ )
    {
      pool.push( createFn() );
    }

    return {
      get: (): T =>
      {
        return pool.pop() || createFn();
      },

      release: ( obj: T ): void =>
      {
        resetFn( obj );
        pool.push( obj );
      },

      getPoolSize: (): number => pool.length,
    };
  },

  // Debounce function
  debounce: <T extends ( ...args: any[] ) => any> ( func: T, delay: number ) =>
  {
    let timeoutId: NodeJS.Timeout;

    return ( ...args: Parameters<T> ) =>
    {
      clearTimeout( timeoutId );
      timeoutId = setTimeout( () => func( ...args ), delay );
    };
  },

  // Throttle function
  throttle: <T extends ( ...args: any[] ) => any> ( func: T, delay: number ) =>
  {
    let lastCall = 0;

    return ( ...args: Parameters<T> ) =>
    {
      const now = Date.now();
      if ( now - lastCall >= delay )
      {
        lastCall = now;
        func( ...args );
      }
    };
  },
};

// Storage utilities for settings and high scores
export const StorageUtils = {
  // Save to localStorage with error handling
  save: ( key: string, data: any ): boolean =>
  {
    try
    {
      localStorage.setItem( key, JSON.stringify( data ) );
      return true;
    } catch ( error )
    {
      console.warn( 'Failed to save to localStorage:', error );
      return false;
    }
  },

  // Load from localStorage with error handling
  load: <T> ( key: string, defaultValue: T ): T =>
  {
    try
    {
      const item = localStorage.getItem( key );
      return item ? JSON.parse( item ) : defaultValue;
    } catch ( error )
    {
      console.warn( 'Failed to load from localStorage:', error );
      return defaultValue;
    }
  },

  // Remove from localStorage
  remove: ( key: string ): boolean =>
  {
    try
    {
      localStorage.removeItem( key );
      return true;
    } catch ( error )
    {
      console.warn( 'Failed to remove from localStorage:', error );
      return false;
    }
  },

  // Check if localStorage is available
  isAvailable: (): boolean =>
  {
    try
    {
      const test = '__test__';
      localStorage.setItem( test, test );
      localStorage.removeItem( test );
      return true;
    } catch
    {
      return false;
    }
  },
}; 