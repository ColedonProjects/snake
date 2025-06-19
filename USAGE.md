# Snake Game Library - Quick Usage Guide

## Installation

```bash
npm install coledon-snake-game
```

## Basic Setup (30 seconds)

```typescript
import { SnakeGameEasterEgg } from 'coledon-snake-game';

// That's it! Users can now activate with Konami Code:
// ↑ ↑ ↓ ↓ ← → ← → B A
new SnakeGameEasterEgg();
```

## Custom Key Sequence

```typescript
import { SnakeGameEasterEgg, SNAKE_SEQUENCE } from 'coledon-snake-game';

new SnakeGameEasterEgg({
  keySequence: SNAKE_SEQUENCE // S-N-A-K-E
});
```

## React Example

```tsx
import { useEffect } from 'react';
import { SnakeGameEasterEgg } from 'coledon-snake-game';

function App() {
  useEffect(() => {
    const snakeEgg = new SnakeGameEasterEgg({
      onGameOpen: () => console.log('🐍 Easter egg found!'),
      onHighScore: (score) => console.log(`New record: ${score}!`)
    });

    return () => snakeEgg.destroy();
  }, []);

  return <div>Your app content...</div>;
}
```

## Manual Trigger

```typescript
const snakeEgg = new SnakeGameEasterEgg();

// Open programmatically
document.getElementById('secret-button').onclick = () => {
  snakeEgg.openGame();
};
```

## All Options

```typescript
new SnakeGameEasterEgg({
  container: '#game-area',           // Where to show game
  keySequence: KONAMI_CODE,          // Trigger sequence
  width: 800,                       // Game width
  height: 600,                      // Game height
  zIndex: 9999,                     // CSS z-index
  autoStart: false,                 // Start immediately
  closeOnEscape: true,              // ESC closes game
  showInstructions: true,           // Show help text
  onGameOpen: () => {},             // Game opened callback
  onGameClose: () => {},            // Game closed callback
  onHighScore: (score) => {}        // New high score callback
});
```

## Predefined Sequences

- `KONAMI_CODE` - Classic ↑↑↓↓←→←→BA
- `SNAKE_SEQUENCE` - Simple SNAKE
- `DEBUG_SEQUENCE` - Quick DEV

## Use Cases

Perfect for:
- Developer portfolios
- Corporate websites  
- 404 error pages
- Employee dashboards
- Gaming platforms
- Educational sites

---

That's it! Your website now has a hidden Snake game. 🎮 