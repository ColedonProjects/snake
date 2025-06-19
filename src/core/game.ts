import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Snake } from './snake';
import { Food } from './food';
import { GameState } from '../types/game-state';
import { InputManager } from './input-manager';
import { ParticleSystem } from '../../srcui/particle-system';
import { PowerUp } from './power-up';
import { ComboPopup } from '../../srcui/combo-popup';
import { ThemeManager, Theme } from '../../srcui/theme-manager';
import { SkinManager, SnakeSkin } from '../../srcui/skin-manager';
import { AchievementSystem } from '../../srcui/achievement-system';

// External UI interface
interface ExternalUI
{
  updateScore ( score: number ): void;
  updateLevel ( level: number ): void;
  updateTheme ( themeName: string ): void;
  updateSkin ( skinName: string ): void;
  updateAchievements ( achievements: string[] ): void;
  updateGameStatus ( status: 'ready' | 'playing' | 'paused' | 'game-over' ): void;
  unlockAchievement ( achievementName: string ): void;
  gameCompleted ( finalScore: number ): void;
}

// Simple game over overlay for canvas
class GameOverOverlay
{
  public container: Container;
  private graphics!: Graphics;
  private titleText!: Text;
  private restartText!: Text;
  private onRestart: ( () => void ) | null = null;

  constructor ()
  {
    this.container = new Container();
    this.container.visible = false;
    this.createOverlay();
  }

  private createOverlay (): void
  {
    // Semi-transparent background
    this.graphics = new Graphics();
    this.graphics.beginFill( 0x000000, 0.8 );
    this.graphics.drawRect( 0, 0, 800, 600 );
    this.graphics.endFill();
    this.container.addChild( this.graphics );

    // Game Over text
    const titleStyle = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: '#ff4444',
      fontWeight: 'bold',
    } );

    this.titleText = new Text( 'GAME OVER', titleStyle );
    this.titleText.anchor.set( 0.5 );
    this.titleText.position.set( 400, 250 );
    this.container.addChild( this.titleText );

    // Restart instruction
    const restartStyle = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffffff',
    } );

    this.restartText = new Text( 'Press SPACE to restart', restartStyle );
    this.restartText.anchor.set( 0.5 );
    this.restartText.position.set( 400, 320 );
    this.container.addChild( this.restartText );
  }

  public show ( onRestart: () => void ): void
  {
    this.container.visible = true;
    this.onRestart = onRestart;

    // Listen for spacebar
    const spaceHandler = ( event: KeyboardEvent ) =>
    {
      if ( event.code === 'Space' )
      {
        this.hide();
        if ( this.onRestart ) this.onRestart();
        window.removeEventListener( 'keydown', spaceHandler );
      }
    };
    window.addEventListener( 'keydown', spaceHandler );
  }

  public hide (): void
  {
    this.container.visible = false;
  }
}

export class Game
{
  private app: Application;
  private gameContainer: Container;
  private snake: Snake;
  private food: Food;
  private powerUp: PowerUp;
  private gameState: GameState;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private inputManager: InputManager;
  private externalUI: ExternalUI;
  private gameOverOverlay: GameOverOverlay;
  private particles: ParticleSystem;
  private powerUpTimer: number = 0;
  private powerUpActive: boolean = false;
  private powerUpDuration: number = 300; // frames (5 seconds at 60fps)
  private powerUpChance: number = 0.01; // chance per frame to spawn
  private comboPopup: ComboPopup;
  private comboCount: number = 0; // foods eaten in window
  private comboTimer: number = 0; // frames left in window
  private comboWindow: number = 1800; // 30 seconds at 60fps
  private currentSkin: SnakeSkin;
  private achievements: AchievementSystem;

  constructor ( app: Application, externalUI: ExternalUI )
  {
    console.log( '[Game] Constructor starting...' );
    this.app = app;
    this.externalUI = externalUI;
    this.gameContainer = new Container();
    this.app.stage.addChild( this.gameContainer );

    // Initialize game state
    this.gameState = {
      score: 0,
      level: 1,
      speed: 1,
      isGameOver: false,
    };

    // Create game objects
    this.snake = new Snake();
    this.food = new Food();
    this.powerUp = new PowerUp();

    // Add game objects to container
    this.gameContainer.addChild( this.snake.container );
    this.gameContainer.addChild( this.food.container );
    this.gameContainer.addChild( this.powerUp.container );

    // Game over overlay (minimal, only for game over state)
    this.gameOverOverlay = new GameOverOverlay();
    this.app.stage.addChild( this.gameOverOverlay.container );

    // Particle system
    this.particles = new ParticleSystem();
    this.app.stage.addChild( this.particles.container );

    this.comboPopup = new ComboPopup();
    this.app.stage.addChild( this.comboPopup.container );

    // Theme management
    ThemeManager.onThemeChange( theme => this.applyTheme( theme ) );
    window.addEventListener( 'keydown', e =>
    {
      if ( e.key.toLowerCase() === 't' )
      {
        this.nextTheme();
      }
    } );

    // Skin management
    this.currentSkin = SkinManager.getSkin();
    this.snake.setColor( this.currentSkin.color );
    SkinManager.onSkinChange( skin =>
    {
      this.currentSkin = skin;
      this.snake.setColor( skin.color );
      this.externalUI.updateSkin( skin.name );
    } );
    window.addEventListener( 'keydown', e =>
    {
      if ( e.key.toLowerCase() === 's' )
      {
        this.nextSkin();
      }
    } );

    // Game controls
    window.addEventListener( 'keydown', e =>
    {
      if ( e.code === 'Space' )
      {
        e.preventDefault();
        this.togglePause();
      }
      else if ( e.code === 'Escape' )
      {
        e.preventDefault();
        this.restart();
      }
    } );

    // Achievement system
    this.achievements = new AchievementSystem();
    this.achievements.setOnAchievementUnlocked( ( achievementName ) =>
    {
      this.externalUI.unlockAchievement( achievementName );
    } );
    this.app.stage.addChild( this.achievements.container );

    // Initialize input manager
    this.inputManager = InputManager.getInstance();
    this.inputManager.initialize();

    // Apply theme after all objects are created
    this.applyTheme( ThemeManager.getTheme() );

    // Initialize external UI
    this.externalUI.updateTheme( ThemeManager.getTheme().name );
    this.externalUI.updateSkin( this.currentSkin.name );
    this.externalUI.updateGameStatus( 'ready' );

    // Set up game loop
    this.app.ticker.add( this.update.bind( this ) );
    console.log( '[Game] Constructor complete, ticker added' );
  }

  public nextTheme (): void
  {
    ThemeManager.nextTheme();
    this.externalUI.updateTheme( ThemeManager.getTheme().name );
  }

  public nextSkin (): void
  {
    SkinManager.nextSkin();
  }

  public togglePause (): void
  {
    if ( !this.isRunning || this.gameState.isGameOver ) return;

    this.isPaused = !this.isPaused;
    this.externalUI.updateGameStatus( this.isPaused ? 'paused' : 'playing' );
    console.log( `[Game] ${ this.isPaused ? 'Paused' : 'Resumed' }` );
  }

  public restart (): void
  {
    if ( this.isRunning || this.gameState.isGameOver )
    {
      this.start();
    }
  }

  public start (): void
  {
    console.log( '[Game] Start called' );

    // Game initialization
    this.isRunning = true;
    this.isPaused = false;
    this.gameState.isGameOver = false;
    this.gameState.score = 0;
    this.gameState.level = 1;
    this.gameState.speed = 1;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.powerUpTimer = 0;
    this.powerUpActive = false;
    this.powerUp.hide();

    // Reset game objects
    this.snake.reset();
    this.food.reset( this.snake.getBody() );
    this.gameOverOverlay.hide();

    // Update external UI
    this.externalUI.updateScore( this.gameState.score );
    this.externalUI.updateLevel( this.gameState.level );
    this.externalUI.updateGameStatus( 'playing' );

    this.achievements.resetGameSession();
    console.log( '[Game] Start complete, isRunning:', this.isRunning );
  }

  private update ( delta: number ): void
  {
    if ( !this.isRunning || this.gameState.isGameOver || this.isPaused ) return;

    // Only allow one direction change per movement step
    const nextDir = this.inputManager.getAndConsumeNextDirection();
    this.snake.setNextDirection( nextDir );

    // Power-up spawn logic
    if ( !this.powerUp.isActive && !this.powerUpActive && Math.random() < this.powerUpChance )
    {
      this.powerUp.spawn( this.snake.getBody(), this.food.position );
    }

    // Update game objects
    this.snake.update( delta * this.gameState.speed );
    this.inputManager.setCurrentDirection( this.snake.getDirection() );

    this.food.update( delta );
    this.powerUp.update( delta );
    this.particles.update();
    this.comboPopup.update();
    if ( this.comboTimer > 0 ) this.comboTimer--;
    if ( this.comboTimer === 0 ) this.comboCount = 0;

    // Power-up effect timer
    if ( this.powerUpActive )
    {
      this.powerUpTimer--;
      if ( this.powerUpTimer <= 0 )
      {
        this.gameState.speed = 1 + ( this.gameState.level - 1 ) * 0.2;
        this.powerUpActive = false;
      }
    }

    // Check for game ending conditions
    this.checkCollisions();

    // Update external UI
    this.externalUI.updateScore( this.gameState.score );
    this.externalUI.updateLevel( this.gameState.level );
    this.achievements.updateSurvivalTime();
  }

  private checkCollisions (): void
  {
    // Check snake-food collision
    if ( this.snake.checkFoodCollision( this.food.position ) )
    {
      this.snake.grow();

      // Combo logic: foods eaten in 30s window
      if ( this.comboTimer > 0 )
      {
        this.comboCount++;
      } else
      {
        this.comboCount = 1;
      }
      this.comboTimer = this.comboWindow;
      let bonus = 0;
      if ( this.comboCount > 0 && this.comboCount % 5 === 0 )
      {
        bonus = this.comboCount * 10;
        console.log( `[Combo] ${ this.comboCount } foods in 30s! +${ bonus }` );
        this.comboPopup.show( `${ this.comboCount } foods in 30s! +${ bonus }` );
        this.particles.burstAt( this.food.position.x, this.food.position.y, this.currentSkin.particle, 48 );
        this.achievements.updateComboCount();
      }
      // Particle burst at food
      this.particles.burstAt( this.food.position.x, this.food.position.y, this.currentSkin.particle );
      this.food.reset( this.snake.getBody() );
      this.gameState.score += 10 + bonus;
      this.achievements.updateScore( this.gameState.score );
      this.checkLevelUp();
    }

    // Check power-up collision
    if ( this.powerUp.isActive && this.snake.getBody()[ 0 ].x === this.powerUp.position.x && this.snake.getBody()[ 0 ].y === this.powerUp.position.y )
    {
      this.powerUp.hide();
      this.powerUpActive = true;
      this.powerUpTimer = this.powerUpDuration;
      this.gameState.speed = 2 + ( this.gameState.level - 1 ) * 0.2; // speed boost
      this.particles.burstAt( this.powerUp.position.x, this.powerUp.position.y, 0x66ccff );
      this.achievements.updatePowerUpCount();
    }

    // Check wall and self collisions
    if ( this.snake.checkWallCollision() || this.snake.checkSelfCollision() )
    {
      this.gameOver();
    }
  }

  private checkLevelUp (): void
  {
    const newLevel = Math.floor( this.gameState.score / 100 ) + 1;
    if ( newLevel > this.gameState.level )
    {
      this.gameState.level = newLevel;
      this.gameState.speed = 1 + ( this.gameState.level - 1 ) * 0.2;
      this.externalUI.updateLevel( this.gameState.level );
      this.achievements.updateLevel( this.gameState.level );
      console.log( `[Game] Level up! New level: ${ this.gameState.level }, speed: ${ this.gameState.speed }` );
    }
  }

  private gameOver (): void
  {
    console.log( '[Game] Game over!' );
    const finalScore = this.gameState.score;

    this.isRunning = false;
    this.isPaused = false;
    this.gameState.isGameOver = true;
    this.externalUI.updateGameStatus( 'game-over' );

    // Record the completed game
    this.externalUI.gameCompleted( finalScore );

    this.particles.burstAt( this.snake.getBody()[ 0 ].x, this.snake.getBody()[ 0 ].y, 0xff0000, 36 );

    this.gameOverOverlay.show( () =>
    {
      this.start();
    } );
  }

  private applyTheme ( theme: Theme )
  {
    // Set background
    this.app.renderer.background.color = theme.background;
  }
} 