# 🐍 Snake Game Library

A modern Snake game that can be embedded as a hidden easter egg in any web application! Built with TypeScript and Pixi.js, featuring enhanced graphics, multiple themes, achievement system, and responsive design.

## 🎮 Two Ways to Use

### 1. **Easter Egg Library** (Recommended for integration)
Install as a hidden easter egg in your web application that users can discover with secret key sequences!

### 2. **Standalone Game**
Run as a complete standalone game application.

---

## 📦 Installation (Library Mode)

```bash
npm install @coledonprojects/snake-game
```

## 🚀 Quick Start (Library Mode)

### Basic Setup (Konami Code)

```typescript
import { SnakeGameEasterEgg } from '@coledonprojects/snake-game';

// Initialize with default Konami Code sequence
const snakeEgg = new SnakeGameEasterEgg();

// Users can now trigger the game with:
// ↑ ↑ ↓ ↓ ← → ← → B A
```

### Custom Key Sequence

```typescript
import { SnakeGameEasterEgg, SNAKE_SEQUENCE } from '@coledonprojects/snake-game';

const snakeEgg = new SnakeGameEasterEgg({
  keySequence: SNAKE_SEQUENCE, // S-N-A-K-E
  onGameOpen: () => console.log('🐍 Snake game opened!'),
  onHighScore: (score) => console.log(`New high score: ${score}!`),
});
```

### Advanced Configuration

```typescript
import { SnakeGameEasterEgg } from '@coledonprojects/snake-game';

const snakeEgg = new SnakeGameEasterEgg({
  // Custom container (default: document.body)
  container: '#my-container',
  
  // Custom key sequence
  keySequence: {
    keys: ['KeyG', 'KeyA', 'KeyM', 'KeyE'],
    timeWindow: 2000,
    caseSensitive: false
  },
  
  // Game appearance
  width: 1000,
  height: 700,
  zIndex: 9999,
  
  // Behavior options
  autoStart: false,
  closeOnEscape: true,
  showInstructions: true,
  
  // Event callbacks
  onGameOpen: () => {
    console.log('Easter egg discovered!');
    // Track analytics, show notifications, etc.
  },
  onGameClose: () => {
    console.log('Game closed');
  },
  onHighScore: (score) => {
    // Save to leaderboard, show celebrations, etc.
    console.log(`Amazing! New high score: ${score}`);
  }
});

// Manual control
snakeEgg.openGame();  // Force open
snakeEgg.closeGame(); // Force close
snakeEgg.destroy();   // Clean up when done
```

## 🎯 Predefined Key Sequences

```typescript
import { KONAMI_CODE, SNAKE_SEQUENCE, DEBUG_SEQUENCE } from '@coledonprojects/snake-game';

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
KONAMI_CODE

// Simple: S-N-A-K-E
SNAKE_SEQUENCE  

// Debug: D-E-V
DEBUG_SEQUENCE
```

## 🎨 Integration Examples

### React Integration

```tsx
import React, { useEffect, useRef } from 'react';
import { SnakeGameEasterEgg } from '@coledonprojects/snake-game';

function App() {
  const snakeEggRef = useRef<SnakeGameEasterEgg>();

  useEffect(() => {
    snakeEggRef.current = new SnakeGameEasterEgg({
      onGameOpen: () => {
        // Maybe pause other game music, track analytics
        console.log('Secret snake game activated!');
      }
    });

    return () => snakeEggRef.current?.destroy();
  }, []);

  return (
    <div>
      <h1>My Amazing Website</h1>
      <p>Try entering the Konami Code... 😉</p>
      {/* Snake game will overlay when triggered */}
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <p>Secret game hidden inside! 🎮</p>
  </div>
</template>

<script>
import { SnakeGameEasterEgg, SNAKE_SEQUENCE } from '@coledonprojects/snake-game';

export default {
  mounted() {
    this.snakeEgg = new SnakeGameEasterEgg({
      keySequence: SNAKE_SEQUENCE,
      onHighScore: (score) => {
        this.$emit('high-score', score);
      }
    });
  },
  beforeDestroy() {
    this.snakeEgg?.destroy();
  }
}
</script>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my site!</h1>
  <p>Hidden surprise for curious users... 🤫</p>
  
  <script type="module">
    import { SnakeGameEasterEgg } from '@coledonprojects/snake-game';
    
    new SnakeGameEasterEgg({
      showInstructions: true,
      onGameOpen: () => {
        document.title = '🐍 Snake Game!';
      },
      onGameClose: () => {
        document.title = 'My Website';
      }
    });
  </script>
</body>
</html>
```

---

## 🖥️ Standalone Game Mode

For running as a complete standalone application:

### Local Development

```bash
git clone https://github.com/ColedonProjects/snake.git
cd snake
npm install
npm run dev
```

### Controls (Standalone)

- **Arrow Keys** - Control snake direction
- **Space** - Pause/Resume game
- **Escape** - Restart game
- **T** - Cycle through themes
- **S** - Change snake skin
- **Settings Icon (⚙️)** - Access theme and skin options
- **Trophy Icon (🏆)** - View achievements
- **Help Icon (❓)** - Show controls and instructions

### Features (Standalone)

- **Multiple visual themes** (Dark, Light, Retro, Neon, Ocean)
- **Snake customization** with different skin options
- **Achievement system** with unlockable badges
- **Combo scoring** for consecutive food collection
- **Power-ups** including speed boosts and special effects
- **Particle effects** for enhanced visual feedback
- **Persistent statistics** tracking games played, high scores, and averages
- **Responsive design** that works on desktop and mobile devices

---

## ⚙️ Configuration API

### SnakeGameConfig Interface

```typescript
interface SnakeGameConfig {
  // Where to inject the game
  container?: HTMLElement | string;
  
  // Key sequence to trigger
  keySequence?: KeySequence;
  
  // Visual options
  width?: number;        // Game width (default: 800)
  height?: number;       // Game height (default: 600)
  zIndex?: number;       // CSS z-index (default: 10000)
  
  // Behavior
  autoStart?: boolean;         // Start immediately (default: false)
  closeOnEscape?: boolean;     // ESC key closes (default: true)
  showInstructions?: boolean;  // Show help text (default: true)
  
  // Event callbacks
  onGameOpen?: () => void;
  onGameClose?: () => void;
  onHighScore?: (score: number) => void;
}

interface KeySequence {
  keys: string[];              // Key codes (e.g., ['KeyA', 'KeyB'])
  timeWindow?: number;         // Max time to complete (ms)
  caseSensitive?: boolean;     // Case sensitive matching
}
```

## 🔧 Development

### Project Structure (Library)

```
snake/
├── src/
│   ├── lib/                 # Library entry points
│   │   ├── index.ts        # Main exports
│   │   ├── snake-easter-egg.ts  # Easter egg class
│   │   └── types.ts        # TypeScript definitions
│   ├── core/               # Game engine
│   ├── srcui/              # UI components
│   └── utils/              # Utilities
├── dist/                   # Built library
└── index.html             # Standalone demo
```

### Build Commands

```bash
npm run build:lib     # Build library for npm
npm run build         # Build standalone game
npm run dev           # Development server
```

## 🌐 Browser Compatibility

- **Library Mode**: Modern browsers with ES6+ support
- **Standalone**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: [Coming Soon] Mobile browsers on iOS and Android

## 🎯 Use Cases

- **Developer Portfolio**: Hidden game as an easter egg
- **Corporate Websites**: Fun surprise for curious visitors  
- **Gaming Platforms**: Nostalgic mini-game integration
- **Educational Sites**: Interactive coding demonstrations
- **404 Pages**: Entertainment while users are lost
- **Employee Dashboards**: Stress relief during breaks

## 📝 License

MIT License - feel free to use in commercial and personal projects!

## 🤝 Contributing

We love contributions! Check out our [GitHub repository](https://github.com/ColedonProjects/snake) for issues and development setup.

---

*Built with ❤️ using TypeScript and Pixi.js*
