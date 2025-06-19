import { Container, Graphics } from 'pixi.js';
import { Position } from '../types/game-state';

const GRID_SIZE = 20;
const GRID_WIDTH = 800 / GRID_SIZE;
const GRID_HEIGHT = 600 / GRID_SIZE;

export class PowerUp
{
  public container: Container;
  public position: Position;
  private graphics: Graphics;
  public isActive: boolean = false;
  private animationTimer: number = 0;

  constructor ()
  {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild( this.graphics );
    this.position = { x: 0, y: 0 };
    this.hide();
  }

  spawn ( snakeBody: Position[], foodPos: Position )
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
    // Remove positions occupied by the snake or food
    const snakeSet = new Set( snakeBody.map( p => `${ p.x },${ p.y }` ) );
    snakeSet.add( `${ foodPos.x },${ foodPos.y }` );
    const available = validPositions.filter( p => !snakeSet.has( `${ p.x },${ p.y }` ) );
    // Pick a random available position
    if ( available.length > 0 )
    {
      this.position = available[ Math.floor( Math.random() * available.length ) ];
      this.isActive = true;
      this.animationTimer = 0;
      this.draw();
      this.container.visible = true;
    } else
    {
      this.hide();
    }
  }

  hide ()
  {
    this.isActive = false;
    this.container.visible = false;
  }

  public update ( delta: number ): void
  {
    if ( this.isActive )
    {
      this.animationTimer += delta;
      this.draw(); // Redraw for animation effect
    }
  }

  private draw (): void
  {
    this.graphics.clear();

    const centerX = this.position.x + GRID_SIZE / 2;
    const centerY = this.position.y + GRID_SIZE / 2;

    // Create pulsing effect based on animation timer
    const pulseIntensity = Math.sin( this.animationTimer * 0.2 ) * 0.3 + 0.7;

    // Draw electric aura/glow
    this.graphics.beginFill( 0x66ccff, 0.3 * pulseIntensity );
    this.graphics.drawCircle( centerX, centerY, GRID_SIZE / 2 + 2 );
    this.graphics.endFill();

    // Draw lightning bolt shape
    this.graphics.beginFill( 0xffff00 ); // Bright yellow

    // Lightning bolt points (relative to center)
    const lightningPoints = [
      centerX - 3, centerY - 8,  // Top left
      centerX + 1, centerY - 8,  // Top right
      centerX - 2, centerY - 2,  // Middle left
      centerX + 4, centerY - 2,  // Middle right  
      centerX + 1, centerY + 2,  // Lower middle right
      centerX + 6, centerY + 8,  // Bottom right
      centerX + 2, centerY + 8,  // Bottom left
      centerX + 3, centerY + 2,  // Lower middle left
      centerX - 2, centerY + 2,  // Lower left
      centerX - 6, centerY - 4,  // Upper left
    ];

    this.graphics.drawPolygon( lightningPoints );
    this.graphics.endFill();

    // Add white core for brightness
    this.graphics.beginFill( 0xffffff, 0.8 );
    const corePoints = [
      centerX - 1, centerY - 6,
      centerX + 1, centerY - 6,
      centerX - 1, centerY - 1,
      centerX + 2, centerY - 1,
      centerX + 1, centerY + 1,
      centerX + 4, centerY + 6,
      centerX + 2, centerY + 6,
      centerX + 2, centerY + 1,
      centerX - 1, centerY + 1,
      centerX - 4, centerY - 2,
    ];

    this.graphics.drawPolygon( corePoints );
    this.graphics.endFill();

    // Add electric sparks around the bolt
    if ( Math.random() < 0.3 ) // Randomly show sparks
    {
      this.graphics.beginFill( 0x00ffff, 0.8 );
      for ( let i = 0; i < 3; i++ )
      {
        const sparkX = centerX + ( Math.random() - 0.5 ) * GRID_SIZE;
        const sparkY = centerY + ( Math.random() - 0.5 ) * GRID_SIZE;
        this.graphics.drawCircle( sparkX, sparkY, 1 );
      }
      this.graphics.endFill();
    }
  }
} 