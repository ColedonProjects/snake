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

  public update ( _delta: number ): void
  {
    // No-op for now
  }

  private draw (): void
  {
    this.graphics.clear();
    this.graphics.beginFill( 0x3399ff );
    this.graphics.drawCircle( this.position.x, this.position.y, GRID_SIZE / 2 );
    this.graphics.endFill();
  }
} 