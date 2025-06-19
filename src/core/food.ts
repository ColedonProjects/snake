import { Container, Graphics } from 'pixi.js';
import { Position } from '../types/game-state';

const GRID_SIZE = 20;
const GRID_WIDTH = 800 / GRID_SIZE;
const GRID_HEIGHT = 600 / GRID_SIZE;

export class Food
{
  public container: Container;
  public position: Position;
  private graphics: Graphics;

  constructor ()
  {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild( this.graphics );
    this.position = { x: 0, y: 0 };
    this.reset( [] );
  }

  // Accepts snakeBody: Position[]
  public reset ( snakeBody: Position[] )
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
    // Remove positions occupied by the snake
    const snakeSet = new Set( snakeBody.map( p => `${ p.x },${ p.y }` ) );
    const available = validPositions.filter( p => !snakeSet.has( `${ p.x },${ p.y }` ) );
    // Pick a random available position
    if ( available.length > 0 )
    {
      this.position = available[ Math.floor( Math.random() * available.length ) ];
    }
    else
    {
      // Fallback: no available positions (should only happen if snake fills the grid)
      this.position = { x: 0, y: 0 };
    }
    this.draw();
  }

  public update ( _delta: number ): void
  {
    // Food doesn't need to update, but we keep the method for consistency
  }

  private draw (): void
  {
    this.graphics.clear();
    this.graphics.beginFill( 0xff0000 );
    this.graphics.drawCircle(
      this.position.x,
      this.position.y,
      GRID_SIZE / 2
    );
    this.graphics.endFill();
  }
} 