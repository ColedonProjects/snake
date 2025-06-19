import { Application } from 'pixi.js';
import { SnakeGameConfig, KeySequence, KONAMI_CODE } from './types';
import { Game } from '../core/game';
import { CookieManager } from '../utils/cookie-manager';

export class SnakeGameEasterEgg
{
  private config: Required<SnakeGameConfig>;
  private keySequenceDetector: KeySequenceDetector;
  private gameOverlay: HTMLElement | null = null;
  private pixiApp: Application | null = null;
  private game: Game | null = null;
  private isGameOpen = false;

  constructor ( config: SnakeGameConfig = {} )
  {
    // Set default configuration
    this.config = {
      container: document.body,
      keySequence: KONAMI_CODE,
      width: 800,
      height: 600,
      zIndex: 10000,
      autoStart: false,
      closeOnEscape: true,
      showInstructions: true,
      onGameOpen: () => { },
      onGameClose: () => { },
      onHighScore: () => { },
      ...config
    };

    // Initialize key sequence detector
    this.keySequenceDetector = new KeySequenceDetector(
      this.config.keySequence,
      () => this.toggleGame()
    );

    // Auto-start if requested
    if ( this.config.autoStart )
    {
      this.openGame();
    }
  }

  /**
   * Manually trigger the game (bypassing key sequence)
   */
  public openGame (): void
  {
    if ( this.isGameOpen ) return;

    this.createGameOverlay();
    this.initializeGame();
    this.isGameOpen = true;
    this.config.onGameOpen();
  }

  /**
   * Close the game
   */
  public closeGame (): void
  {
    if ( !this.isGameOpen ) return;

    this.destroyGameOverlay();
    this.isGameOpen = false;
    this.config.onGameClose();
  }

  /**
   * Toggle game open/close
   */
  public toggleGame (): void
  {
    if ( this.isGameOpen )
    {
      this.closeGame();
    } else
    {
      this.openGame();
    }
  }

  /**
   * Destroy the easter egg instance and clean up
   */
  public destroy (): void
  {
    this.keySequenceDetector.destroy();
    this.closeGame();
  }

  /**
   * Update configuration
   */
  public updateConfig ( newConfig: Partial<SnakeGameConfig> ): void
  {
    this.config = { ...this.config, ...newConfig };
  }

  private createGameOverlay (): void
  {
    // Create overlay container
    this.gameOverlay = document.createElement( 'div' );
    this.gameOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: ${ this.config.zIndex };
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-family: Arial, sans-serif;
    `;

    // Create game container
    const gameContainer = document.createElement( 'div' );
    gameContainer.id = 'snake-easter-egg-container';
    gameContainer.style.cssText = `
      position: relative;
      border: 3px solid #333;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    `;

    // Create close button
    const closeButton = document.createElement( 'button' );
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 18px;
      cursor: pointer;
      border-radius: 50%;
      z-index: 1;
    `;
    closeButton.addEventListener( 'click', () => this.closeGame() );

    // Create instructions (if enabled)
    if ( this.config.showInstructions )
    {
      const instructions = document.createElement( 'div' );
      instructions.style.cssText = `
        color: white;
        margin-bottom: 20px;
        text-align: center;
        font-size: 14px;
      `;
      instructions.innerHTML = `
        <p>🐍 Hidden Snake Game Discovered!</p>
        <p>Use arrow keys to control • Press ESC to close</p>
      `;
      this.gameOverlay.appendChild( instructions );
    }

    this.gameOverlay.appendChild( gameContainer );
    gameContainer.appendChild( closeButton );

    // Handle escape key
    if ( this.config.closeOnEscape )
    {
      const escapeHandler = ( e: KeyboardEvent ) =>
      {
        if ( e.key === 'Escape' )
        {
          this.closeGame();
          document.removeEventListener( 'keydown', escapeHandler );
        }
      };
      document.addEventListener( 'keydown', escapeHandler );
    }

    // Get container element
    const container = typeof this.config.container === 'string'
      ? document.querySelector( this.config.container )
      : this.config.container;

    if ( container )
    {
      container.appendChild( this.gameOverlay );
    }
  }

  private initializeGame (): void
  {
    if ( !this.gameOverlay ) return;

    const gameContainer = this.gameOverlay.querySelector( '#snake-easter-egg-container' ) as HTMLElement;
    if ( !gameContainer ) return;

    // Create Pixi application
    this.pixiApp = new Application( {
      width: this.config.width,
      height: this.config.height,
      backgroundColor: 0x000000,
      antialias: true,
    } );

    gameContainer.appendChild( this.pixiApp.view as HTMLCanvasElement );

    // Create simplified UI for easter egg mode
    const easterEggUI = new EasterEggUI( ( score ) =>
    {
      this.config.onHighScore( score );
    } );

    // Create and start the game
    this.game = new Game( this.pixiApp, easterEggUI );
    this.game.start();
  }

  private destroyGameOverlay (): void
  {
    if ( this.pixiApp )
    {
      this.pixiApp.destroy( true );
      this.pixiApp = null;
    }

    if ( this.game )
    {
      this.game = null;
    }

    if ( this.gameOverlay )
    {
      this.gameOverlay.remove();
      this.gameOverlay = null;
    }
  }
}

// Key sequence detection utility
class KeySequenceDetector
{
  private sequence: string[] = [];
  private timeWindow: number;
  private caseSensitive: boolean;
  private currentIndex = 0;
  private lastKeyTime = 0;
  private callback: () => void;

  constructor ( keySequence: KeySequence, callback: () => void )
  {
    this.sequence = keySequence.keys;
    this.timeWindow = keySequence.timeWindow || 3000;
    this.caseSensitive = keySequence.caseSensitive || false;
    this.callback = callback;

    document.addEventListener( 'keydown', this.handleKeyDown.bind( this ) );
  }

  private handleKeyDown ( event: KeyboardEvent ): void
  {
    const now = Date.now();
    const expectedKey = this.sequence[ this.currentIndex ];
    const actualKey = this.caseSensitive ? event.code : event.code.toLowerCase();
    const targetKey = this.caseSensitive ? expectedKey : expectedKey.toLowerCase();

    // Reset if too much time has passed
    if ( now - this.lastKeyTime > this.timeWindow )
    {
      this.currentIndex = 0;
    }

    // Check if the key matches the expected key in sequence
    if ( actualKey === targetKey )
    {
      this.currentIndex++;
      this.lastKeyTime = now;

      // Sequence completed
      if ( this.currentIndex >= this.sequence.length )
      {
        this.callback();
        this.currentIndex = 0;
      }
    } else
    {
      // Wrong key, reset sequence
      this.currentIndex = 0;
    }
  }

  public destroy (): void
  {
    document.removeEventListener( 'keydown', this.handleKeyDown.bind( this ) );
  }
}

// Simplified UI for easter egg mode
class EasterEggUI
{
  private onHighScore: ( score: number ) => void;

  constructor ( onHighScore: ( score: number ) => void )
  {
    this.onHighScore = onHighScore;
  }

  updateScore ( score: number ): void
  {
    if ( CookieManager.updateHighScore( score ) )
    {
      this.onHighScore( score );
    }
  }

  updateLevel (): void { }
  updateTheme (): void { }
  updateSkin (): void { }
  updateAchievements (): void { }
  updateGameStatus (): void { }
  unlockAchievement (): void { }
  gameCompleted ( finalScore: number ): void
  {
    CookieManager.recordGame( finalScore );
  }
} 