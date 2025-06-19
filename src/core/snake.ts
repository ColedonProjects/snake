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

    // Create initial snake body (head at highest x)
    for ( let i = INITIAL_LENGTH - 1; i >= 0; i-- )
    {
      this.body.push( { x: i * GRID_SIZE, y: 0 } );
    }

    this.draw();
  }

  public update ( delta: number ): void
  {
    // Convert delta to seconds (assuming 60 FPS)
    this.moveTimer += delta / 60;
    if ( this.moveTimer >= MOVE_INTERVAL )
    {
      this.move();
      this.moveTimer = 0;
    }
  }

  public setDirection ( direction: Direction ): void
  {
    // Prevent 180-degree turns
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };

    if ( opposites[ direction ] !== this.direction && direction !== this.direction )
    {
      console.log( '[Snake] Direction changed from', this.direction, 'to', direction );
      this.direction = direction;
    }
  }

  public grow (): void
  {
    const tail = this.body[ this.body.length - 1 ];
    this.body.push( { ...tail } );
    console.log( '[Snake] Grew! New length:', this.body.length );
  }

  public checkFoodCollision ( foodPosition: Position ): boolean
  {
    const head = this.body[ 0 ];
    const collision = head.x === foodPosition.x && head.y === foodPosition.y;
    if ( collision ) console.log( '[Snake] Food collision detected at', head );
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
    if ( hitWall ) console.log( '[Snake] Wall collision detected at', head );
    return hitWall;
  }

  public checkSelfCollision (): boolean
  {
    const head = this.body[ 0 ];
    const selfHit = this.body.slice( 1 ).some( segment =>
      segment.x === head.x && segment.y === head.y
    );
    if ( selfHit ) console.log( '[Snake] Self collision detected at', head );
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
    // Apply buffered direction change if present
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
    console.log( '[Snake] Moving. Current head:', head, 'direction:', this.direction );
    // Update head position based on direction
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

    // Add new head and remove tail
    this.body.unshift( head );
    this.body.pop();

    this.draw();
    console.log( '[Snake] New head position:', head, 'Body:', this.body );
  }

  private draw (): void
  {
    this.graphics.clear();

    // Draw each segment with improved snake-like appearance
    this.body.forEach( ( segment, index ) =>
    {
      if ( index === 0 )
      {
        // Draw snake head with eyes
        this.drawSnakeHead( segment );
      } else
      {
        // Draw body segment
        this.drawBodySegment( segment, index );
      }
    } );
  }

  private drawSnakeHead ( position: Position ): void
  {
    const headSize = GRID_SIZE - 2;
    const centerX = position.x + GRID_SIZE / 2;
    const centerY = position.y + GRID_SIZE / 2;

    // Draw head (slightly larger rounded rectangle)
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