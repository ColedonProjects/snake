import { Direction } from '../types/game-state';

export class InputManager
{
  private static instance: InputManager;
  private currentDirection: Direction = 'right';
  private nextDirection: Direction | null = null;
  private isInitialized: boolean = false;

  private constructor () { }

  public static getInstance (): InputManager
  {
    if ( !InputManager.instance )
    {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public initialize (): void
  {
    if ( this.isInitialized ) return;

    window.addEventListener( 'keydown', this.handleKeyDown.bind( this ) );
    this.isInitialized = true;
  }

  public getCurrentDirection (): Direction
  {
    return this.currentDirection;
  }

  public getAndConsumeNextDirection (): Direction | null
  {
    const dir = this.nextDirection;
    this.nextDirection = null;
    return dir;
  }

  public setCurrentDirection ( direction: Direction )
  {
    this.currentDirection = direction;
  }

  private handleKeyDown ( event: KeyboardEvent ): void
  {
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    let newDirection: Direction | null = null;
    switch ( event.key )
    {
      case 'ArrowUp':
        newDirection = 'up';
        break;
      case 'ArrowDown':
        newDirection = 'down';
        break;
      case 'ArrowLeft':
        newDirection = 'left';
        break;
      case 'ArrowRight':
        newDirection = 'right';
        break;
    }
    if (
      newDirection &&
      newDirection !== this.currentDirection &&
      newDirection !== opposites[ this.currentDirection ]
    )
    {
      this.nextDirection = newDirection;
    }
  }
} 