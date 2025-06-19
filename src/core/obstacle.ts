import { Container, Graphics } from 'pixi.js';
import { Position } from '../types/game-state';

const GRID_SIZE = 20;
const GRID_WIDTH = 800 / GRID_SIZE;
const GRID_HEIGHT = 600 / GRID_SIZE;

export class ObstacleManager
{
  public container: Container;
  private obstacles: Position[] = [];
  private graphics: Graphics;
  private color: number = 0x888888;

  constructor ()
  {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild( this.graphics );
  }

  reset ()
  {
    this.obstacles = [];
    this.draw();
  }

  spawn ( count: number, snakeBody: Position[], foodPos: Position, powerUpPos: Position )
  {
    // Generate all possible positions within bounds
    const validPositions: Position[] = [];
    for ( let x = 0; x < GRID_WIDTH; x++ )
    {
      for ( let y = 0; y < GRID_HEIGHT; y++ )
      {
        validPositions.push( { x: x * GRID_SIZE, y: y * GRID_SIZE } );
      }
    }
    // Remove positions occupied by the snake, food, or power-up
    const occupied = new Set( [
      ...snakeBody.map( p => `${ p.x },${ p.y }` ),
      `${ foodPos.x },${ foodPos.y }`,
      `${ powerUpPos.x },${ powerUpPos.y }`,
    ] );
    const available = validPositions.filter( p => !occupied.has( `${ p.x },${ p.y }` ) );
    // Randomly pick positions
    for ( let i = 0; i < count && available.length > 0; i++ )
    {
      const idx = Math.floor( Math.random() * available.length );
      this.obstacles.push( available[ idx ] );
      available.splice( idx, 1 );
    }
    this.draw();
  }

  setColor ( color: number )
  {
    this.color = color;
    this.draw();
  }

  getObstacles (): Position[]
  {
    return this.obstacles;
  }

  private draw ()
  {
    this.graphics.clear();
    this.graphics.beginFill( this.color );
    for ( const obs of this.obstacles )
    {
      this.graphics.drawRect( obs.x, obs.y, GRID_SIZE, GRID_SIZE );
    }
    this.graphics.endFill();
  }
} 