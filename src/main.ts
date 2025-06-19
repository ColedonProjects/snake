import { Application } from 'pixi.js';
import { Game } from './core/game';

// Create the Pixi application
const app = new Application( {
  width: 800,
  height: 600,
  backgroundColor: 0x000000,
  antialias: true,
} );

// Add the canvas to the DOM
document.getElementById( 'game-container' )?.appendChild( app.view as HTMLCanvasElement );

// Create and start the game
const game = new Game( app );
game.start(); 