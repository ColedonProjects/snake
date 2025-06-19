# Snake Game

A modern implementation of the classic Snake game built with TypeScript and Pixi.js, featuring enhanced graphics, multiple themes, achievement system, and responsive design.

## Features

- **Smooth gameplay** with fluid snake movement and responsive controls
- **Progressive difficulty** with increasing speed as you level up
- **Multiple visual themes** (Dark, Light, Retro, Neon, Ocean)
- **Snake customization** with different skin options
- **Achievement system** with unlockable badges
- **Combo scoring** for consecutive food collection
- **Power-ups** including speed boosts and special effects
- **Particle effects** for enhanced visual feedback
- **Persistent statistics** tracking games played, high scores, and averages
- **Responsive design** that works on desktop and mobile devices
- **Modern UI** with popup dialogs for settings and information

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snake.git
cd snake
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Controls

- **Arrow Keys** - Control snake direction
- **Space** - Pause/Resume game
- **Escape** - Restart game
- **T** - Cycle through themes
- **S** - Change snake skin
- **Settings Icon (⚙️)** - Access theme and skin options
- **Trophy Icon (🏆)** - View achievements
- **Help Icon (❓)** - Show controls and instructions

## Gameplay

- Guide your snake to collect food and grow longer
- Avoid hitting walls or your own body
- Score points for each food collected
- Achieve combo bonuses by eating food quickly in succession
- Collect power-ups for temporary speed boosts
- Progress through levels as your score increases
- Unlock achievements for various accomplishments

## Development

### Project Structure

```
snake/
├── src/
│   ├── core/           # Core game logic (Snake, Food, Game engine)
│   ├── modes/          # Game mode management
│   ├── storage/        # Settings and data persistence
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions and constants
├── srcui/              # UI components and visual effects
├── assets/             # Game assets (currently unused)
├── dist/               # Build output
└── index.html          # Main HTML file with embedded styles
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production version
- `npm run preview` - Preview production build locally
- `npm run lint` - Run TypeScript linter
- `npm run format` - Format code with Prettier

### Technologies Used

- **TypeScript** - Type-safe JavaScript development
- **Pixi.js** - High-performance 2D rendering engine
- **Vite** - Fast build tool and development server
- **CSS Grid & Flexbox** - Modern responsive layout
- **Browser Cookies** - Persistent data storage

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Mobile browsers on iOS and Android

## License

This project is licensed under the MIT License. 