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

    const centerX = this.position.x + GRID_SIZE / 2;
    const centerY = this.position.y + GRID_SIZE / 2;
    const appleRadius = ( GRID_SIZE - 6 ) / 2;

    // Draw apple body
    this.graphics.beginFill( 0xff3333 ); // Red apple
    this.graphics.drawCircle( centerX, centerY, appleRadius );
    this.graphics.endFill();

    // Add apple highlight
    this.graphics.beginFill( 0xff6666, 0.7 );
    this.graphics.drawCircle( centerX - 2, centerY - 2, appleRadius * 0.6 );
    this.graphics.endFill();

    // Add apple shine
    this.graphics.beginFill( 0xffffff, 0.5 );
    this.graphics.drawCircle( centerX - 3, centerY - 3, appleRadius * 0.3 );
    this.graphics.endFill();

    // Draw apple stem
    this.graphics.lineStyle( 2, 0x8B4513 ); // Brown stem
    this.graphics.moveTo( centerX, centerY - appleRadius + 1 );
    this.graphics.lineTo( centerX, centerY - appleRadius - 4 );

    // Draw small leaf
    this.graphics.lineStyle( 0 );
    this.graphics.beginFill( 0x228B22 ); // Green leaf
    this.graphics.drawEllipse( centerX + 2, centerY - appleRadius - 1, 3, 2 );
    this.graphics.endFill();
  }
} 