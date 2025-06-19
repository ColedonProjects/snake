import { Container, Graphics } from 'pixi.js';
import { Position, Direction } from '../types/game-state';

const GRID_SIZE = 20;
const INITIAL_LENGTH = 3;
const MOVE_INTERVAL = 0.2; // seconds

export class Snake
{
  public container: Container;
  private body: Position[] = [];
  private direction: Direction = 'right';
  private moveTimer: number = 0;
  private graphics: Graphics;
  private nextDirection: Direction | null = null;
  private color: number = 0x00ff00;

  constructor ()
  {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild( this.graphics );
    this.reset();
  }

  public reset (): void
  {
    this.body = [];
    this.direction = 'right';
    this.moveTimer = 0;

    // Create initial snake body starting from left
    for ( let i = INITIAL_LENGTH - 1; i >= 0; i-- )
    {
      this.body.push( { x: i * GRID_SIZE, y: 0 } );
    }

    this.draw();
  }

  public update ( delta: number ): void
  {
    // Track movement timing
    this.moveTimer += delta / 60;
    if ( this.moveTimer >= MOVE_INTERVAL )
    {
      this.move();
      this.moveTimer = 0;
    }
  }

  public setDirection ( direction: Direction ): void
  {
    // Don't allow reversing direction
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };

    if ( opposites[ direction ] !== this.direction && direction !== this.direction )
    {
      // Direction change logged for debugging
      this.direction = direction;
    }
  }

  public grow (): void
  {
    const tail = this.body[ this.body.length - 1 ];
    this.body.push( { ...tail } );
    // Snake grows by one segment
  }

  public checkFoodCollision ( foodPosition: Position ): boolean
  {
    const head = this.body[ 0 ];
    const collision = head.x === foodPosition.x && head.y === foodPosition.y;
    // Check if head touches food position
    return collision;
  }

  public checkWallCollision (): boolean
  {
    const head = this.body[ 0 ];
    const hitWall = (
      head.x < 0 ||
      head.x >= 800 ||
      head.y < 0 ||
      head.y >= 600
    );
    // Return whether snake hit the boundary
    return hitWall;
  }

  public checkSelfCollision (): boolean
  {
    const head = this.body[ 0 ];
    const selfHit = this.body.slice( 1 ).some( segment =>
      segment.x === head.x && segment.y === head.y
    );
    // Return whether snake collided with itself
    return selfHit;
  }

  public setNextDirection ( direction: Direction | null )
  {
    if ( direction && direction !== this.direction )
    {
      this.nextDirection = direction;
    }
  }

  public setColor ( color: number )
  {
    this.color = color;
    this.draw();
  }

  private move (): void
  {
    // Apply any queued direction change
    if ( this.nextDirection )
    {
      const opposites = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };
      if ( this.nextDirection !== opposites[ this.direction ] )
      {
        this.direction = this.nextDirection;
      }
      this.nextDirection = null;
    }
    const head = { ...this.body[ 0 ] };

    // Move head in current direction
    switch ( this.direction )
    {
      case 'up':
        head.y -= GRID_SIZE;
        break;
      case 'down':
        head.y += GRID_SIZE;
        break;
      case 'left':
        head.x -= GRID_SIZE;
        break;
      case 'right':
        head.x += GRID_SIZE;
        break;
    }

    // Move snake forward by adding new head and removing tail
    this.body.unshift( head );
    this.body.pop();

    this.draw();
  }

  private draw (): void
  {
    this.graphics.clear();

    // Render each body segment
    this.body.forEach( ( segment, index ) =>
    {
      if ( index === 0 )
      {
        // Snake head with directional eyes
        this.drawSnakeHead( segment );
      } else
      {
        // Regular body segment
        this.drawBodySegment( segment, index );
      }
    } );
  }

  private drawSnakeHead ( position: Position ): void
  {
    const headSize = GRID_SIZE - 2;
    const centerX = position.x + GRID_SIZE / 2;
    const centerY = position.y + GRID_SIZE / 2;

    // Main head shape
    this.graphics.beginFill( this.color );
    this.graphics.drawRoundedRect(
      centerX - headSize / 2,
      centerY - headSize / 2,
      headSize,
      headSize,
      6
    );
    this.graphics.endFill();

    // Draw eyes based on direction
    this.graphics.beginFill( 0x000000 );
    const eyeSize = 2;

    switch ( this.direction )
    {
      case 'right':
        // Eyes on the right side
        this.graphics.drawCircle( centerX + 3, centerY - 3, eyeSize );
        this.graphics.drawCircle( centerX + 3, centerY + 3, eyeSize );
        break;
      case 'left':
        // Eyes on the left side
        this.graphics.drawCircle( centerX - 3, centerY - 3, eyeSize );
        this.graphics.drawCircle( centerX - 3, centerY + 3, eyeSize );
        break;
      case 'up':
        // Eyes on the top
        this.graphics.drawCircle( centerX - 3, centerY - 3, eyeSize );
        this.graphics.drawCircle( centerX + 3, centerY - 3, eyeSize );
        break;
      case 'down':
        // Eyes on the bottom
        this.graphics.drawCircle( centerX - 3, centerY + 3, eyeSize );
        this.graphics.drawCircle( centerX + 3, centerY + 3, eyeSize );
        break;
    }
    this.graphics.endFill();
  }

  private drawBodySegment ( position: Position, index: number ): void
  {
    const bodySize = GRID_SIZE - 4;
    const centerX = position.x + GRID_SIZE / 2;
    const centerY = position.y + GRID_SIZE / 2;

    // Make segments slightly smaller towards the tail
    const sizeReduction = Math.min( index * 0.5, 4 );
    const segmentSize = bodySize - sizeReduction;

    // Draw body segment with gradient effect (darker towards center)
    const bodyColor = this.adjustColorBrightness( this.color, -0.2 );
    this.graphics.beginFill( bodyColor );
    this.graphics.drawRoundedRect(
      centerX - segmentSize / 2,
      centerY - segmentSize / 2,
      segmentSize,
      segmentSize,
      4
    );
    this.graphics.endFill();

    // Add scale pattern for realism
    if ( index % 2 === 0 )
    {
      const scaleColor = this.adjustColorBrightness( this.color, -0.4 );
      this.graphics.beginFill( scaleColor );
      this.graphics.drawRoundedRect(
        centerX - segmentSize / 4,
        centerY - segmentSize / 4,
        segmentSize / 2,
        segmentSize / 2,
        2
      );
      this.graphics.endFill();
    }
  }

  private adjustColorBrightness ( color: number, adjustment: number ): number
  {
    const r = ( color >> 16 ) & 0xFF;
    const g = ( color >> 8 ) & 0xFF;
    const b = color & 0xFF;

    const newR = Math.max( 0, Math.min( 255, r + ( r * adjustment ) ) );
    const newG = Math.max( 0, Math.min( 255, g + ( g * adjustment ) ) );
    const newB = Math.max( 0, Math.min( 255, b + ( b * adjustment ) ) );

    return ( newR << 16 ) | ( newG << 8 ) | newB;
  }

  public getDirection (): Direction
  {
    return this.direction;
  }

  public getBody (): Position[]
  {
    return this.body;
  }
} 