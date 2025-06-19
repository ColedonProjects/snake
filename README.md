# Snake Game

A modern implementation of the classic Snake game built with TypeScript and Pixi.js.

## Features

- Smooth snake movement and controls
- Progressive difficulty with increasing speed
- Score tracking and level system
- Modern graphics using Pixi.js
- Responsive design

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

4. Open your browser and navigate to `http://localhost:3000`

### Controls

- Use arrow keys to control the snake's direction
- Collect the red food to grow and increase your score
- Avoid hitting the walls or yourself
- Try to achieve the highest score possible!

## Development

### Project Structure

```
snake/
├── src/
│   ├── core/           # Core game logic
│   ├── modes/          # Game modes
│   ├── ui/             # User interface
│   ├── audio/          # Sound effects and music
│   ├── storage/        # Score and settings storage
│   └── utils/          # Utility functions
├── assets/             # Game assets
└── dist/              # Build output
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm run format` - Format code

## License

This project is licensed under the MIT License - see the LICENSE file for details. 