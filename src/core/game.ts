import { Application, Container } from 'pixi.js';
import { Snake } from './snake';
import { Food } from './food';
import { GameState } from '../types/game-state';
import { InputManager } from './input-manager';
import { OverlayUI } from '../../srcui/overlay';
import { ParticleSystem } from '../../srcui/particle-system';
import { PowerUp } from './power-up';
import { ComboPopup } from '../../srcui/combo-popup';
import { ThemeManager, Theme } from '../../srcui/theme-manager';
import { ThemeToggleButton } from '../../srcui/theme-toggle';
import { SkinManager, SnakeSkin } from '../../srcui/skin-manager';
import { SkinToggleButton } from '../../srcui/skin-toggle';
import { ObstacleManager } from './obstacle';
import { AchievementSystem } from '../../srcui/achievement-system';
import { SoundManager, SoundEffect } from '../audio/sound-manager';
import { AudioDebugPanel } from '../../srcui/audio-debug';

export class Game
{
  private app: Application;
  private gameContainer: Container;
  private snake: Snake;
  private food: Food;
  private powerUp: PowerUp;
  private gameState: GameState;
  private isRunning: boolean = false;
  private inputManager: InputManager;
  private overlay: OverlayUI;
  private particles: ParticleSystem;
  private powerUpTimer: number = 0;
  private powerUpActive: boolean = false;
  private powerUpDuration: number = 300; // frames (5 seconds at 60fps)
  private powerUpChance: number = 0.01; // chance per frame to spawn
  private comboPopup: ComboPopup;
  private comboCount: number = 0; // foods eaten in window
  private comboTimer: number = 0; // frames left in window
  private comboWindow: number = 1800; // 30 seconds at 60fps
  private themeToggle: ThemeToggleButton;
  private skinToggle: SkinToggleButton;
  private currentSkin: SnakeSkin;
  private obstacles: ObstacleManager;
  private achievements: AchievementSystem;
  private soundManager: SoundManager;
  private audioDebug: AudioDebugPanel;

  constructor ( app: Application )
  {
    console.log( '[Game] Constructor starting...' );
    this.app = app;
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

    // Overlay UI
    this.overlay = new OverlayUI();
    this.app.stage.addChild( this.overlay.container );
    this.overlay.updateScore( this.gameState.score );
    this.overlay.updateLevel( this.gameState.level );

    // Particle system
    this.particles = new ParticleSystem();
    this.app.stage.addChild( this.particles.container );

    this.comboPopup = new ComboPopup();
    this.app.stage.addChild( this.comboPopup.container );

    this.themeToggle = new ThemeToggleButton();
    this.app.stage.addChild( this.themeToggle.container );
    ThemeManager.onThemeChange( theme => this.applyTheme( theme ) );
    window.addEventListener( 'keydown', e =>
    {
      if ( e.key.toLowerCase() === 't' )
      {
        ThemeManager.nextTheme();
        this.soundManager.play( SoundEffect.BUTTON_CLICK );
      }
    } );

    this.skinToggle = new SkinToggleButton();
    this.app.stage.addChild( this.skinToggle.container );
    this.currentSkin = SkinManager.getSkin();
    this.snake.setColor( this.currentSkin.color );
    SkinManager.onSkinChange( skin =>
    {
      this.currentSkin = skin;
      this.snake.setColor( skin.color );
    } );
    window.addEventListener( 'keydown', e =>
    {
      if ( e.key.toLowerCase() === 's' )
      {
        SkinManager.nextSkin();
        this.soundManager.play( SoundEffect.BUTTON_CLICK );
      }
    } );

    this.obstacles = new ObstacleManager();
    this.app.stage.addChild( this.obstacles.container );

    // Achievement system
    this.achievements = new AchievementSystem();
    this.app.stage.addChild( this.achievements.container );

    // Sound system
    this.soundManager = SoundManager.getInstance();
    this.soundManager.playMusic();

    // Audio debug panel (only in development)
    this.audioDebug = new AudioDebugPanel();
    this.app.stage.addChild( this.audioDebug.container );

    // Initialize input manager
    this.inputManager = InputManager.getInstance();
    this.inputManager.initialize();

    // Apply theme after all objects are created
    this.applyTheme( ThemeManager.getTheme() );

    // Set up game loop
    this.app.ticker.add( this.update.bind( this ) );
    console.log( '[Game] Constructor complete, ticker added' );
  }

  public start (): void
  {
    console.log( '[Game] Start called' );

    // Trigger custom event to help audio initialization
    window.dispatchEvent( new CustomEvent( 'gamestart' ) );

    this.isRunning = true;
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
    this.overlay.hideGameOver();
    this.overlay.updateScore( this.gameState.score );
    this.overlay.updateLevel( this.gameState.level );

    this.obstacles.reset();
    this.spawnObstacles();
    this.achievements.resetGameSession();
    console.log( '[Game] Start complete, isRunning:', this.isRunning );
  }

  private spawnObstacles ()
  {
    // Number of obstacles increases with level
    const count = Math.min( 2 + this.gameState.level, 20 );
    this.obstacles.spawn( count, this.snake.getBody(), this.food.position, this.powerUp.position );
  }

  private update ( delta: number ): void
  {
    // console.log( '[Game] Update called, isRunning:', this.isRunning, 'isGameOver:', this.gameState.isGameOver );
    if ( !this.isRunning || this.gameState.isGameOver ) return;

    // Only allow one direction change per movement step
    const nextDir = this.inputManager.getAndConsumeNextDirection();
    this.snake.setNextDirection( nextDir );

    // Power-up spawn logic
    if ( !this.powerUp.isActive && !this.powerUpActive && Math.random() < this.powerUpChance )
    {
      this.powerUp.spawn( this.snake.getBody(), this.food.position );
    }

    // Update game objects
    const oldLength = this.snake.getBody().length;
    this.snake.update( delta * this.gameState.speed );
    this.inputManager.setCurrentDirection( this.snake.getDirection() );

    // Play movement sound occasionally (every 10 frames at normal speed)
    if ( Math.random() < 0.02 )
    {
      this.soundManager.play( SoundEffect.MOVE );
    }
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

    // Check for collisions
    this.checkCollisions();

    // Update score display
    this.overlay.updateScore( this.gameState.score );
    this.overlay.updateLevel( this.gameState.level );

    this.achievements.update();
    this.achievements.updateSurvivalTime();
  }

  private checkCollisions (): void
  {
    // Check snake-food collision
    if ( this.snake.checkFoodCollision( this.food.position ) )
    {
      this.snake.grow();
      this.soundManager.play( SoundEffect.EAT );

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
        this.soundManager.play( SoundEffect.COMBO );
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
      this.soundManager.play( SoundEffect.POWER_UP );
    }

    // Check obstacle collision
    const head = this.snake.getBody()[ 0 ];
    for ( const obs of this.obstacles.getObstacles() )
    {
      if ( head.x === obs.x && head.y === obs.y )
      {
        this.gameOver();
        return;
      }
    }

    // Check snake-wall collision
    if ( this.snake.checkWallCollision() )
    {
      this.achievements.onWallHit();
      this.gameOver();
    }

    // Check snake-self collision
    if ( this.snake.checkSelfCollision() )
    {
      this.gameOver();
    }
  }

  private checkLevelUp (): void
  {
    if ( this.gameState.score >= this.gameState.level * 100 )
    {
      this.gameState.level++;
      this.gameState.speed += 0.2;
      this.spawnObstacles();
      this.soundManager.play( SoundEffect.LEVEL_UP );
    }
  }

  private gameOver (): void
  {
    this.gameState.isGameOver = true;
    this.isRunning = false;
    this.soundManager.play( SoundEffect.GAME_OVER );
    // Particle burst at snake head
    const head = this.snake.getBody()[ 0 ];
    this.particles.burstAt( head.x, head.y, 0xff4444 );
    this.overlay.showGameOver( () =>
    {
      this.soundManager.play( SoundEffect.BUTTON_CLICK );
      this.start();
    } );
  }

  private applyTheme ( theme: Theme )
  {
    // Set background
    this.app.renderer.background.color = theme.background;
    // TODO: update snake, food, power-up, particles, UI colors
    // This requires updating those classes to accept theme colors
    this.obstacles.setColor( theme.food );
  }
} 