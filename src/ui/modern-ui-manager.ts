import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_CONFIG, COLOR_PALETTES } from '../utils/constants';
import { Position, AnimationUtils } from '../utils/helpers';

// Modern UI components with sleek design
export class ModernUIManager
{
  public container: Container;
  private background!: Graphics;
  private scoreDisplay!: ModernScoreDisplay;
  private gameOverScreen!: GameOverScreen;
  private pauseScreen!: PauseScreen;
  private gameGrid!: GameGrid;
  private statusBar!: StatusBar;
  private miniMap!: MiniMap;
  private currentTheme: any;

  constructor ()
  {
    this.container = new Container();
    this.currentTheme = COLOR_PALETTES.DARK;

    this.createBackground();
    this.createGameGrid();
    this.createStatusBar();
    this.createScoreDisplay();
    this.createMiniMap();
    this.createPauseScreen();
    this.createGameOverScreen();

    this.setupResponsiveLayout();
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.updateBackground();
    this.container.addChild( this.background );
  }

  private updateBackground (): void
  {
    this.background.clear();

    // Modern gradient background
    this.background.beginFill( this.currentTheme.background );
    this.background.drawRect( 0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT );
    this.background.endFill();

    // Add subtle pattern overlay
    this.background.beginFill( this.currentTheme.grid, 0.05 );
    for ( let x = 0; x < GAME_CONFIG.CANVAS_WIDTH; x += GAME_CONFIG.GRID_SIZE )
    {
      for ( let y = 0; y < GAME_CONFIG.CANVAS_HEIGHT; y += GAME_CONFIG.GRID_SIZE )
      {
        if ( ( Math.floor( x / GAME_CONFIG.GRID_SIZE ) + Math.floor( y / GAME_CONFIG.GRID_SIZE ) ) % 2 === 0 )
        {
          this.background.drawRect( x, y, GAME_CONFIG.GRID_SIZE, GAME_CONFIG.GRID_SIZE );
        }
      }
    }
    this.background.endFill();
  }

  private createGameGrid (): void
  {
    this.gameGrid = new GameGrid( this.currentTheme );
    this.container.addChild( this.gameGrid.container );
  }

  private createStatusBar (): void
  {
    this.statusBar = new StatusBar( this.currentTheme );
    this.container.addChild( this.statusBar.container );
  }

  private createScoreDisplay (): void
  {
    this.scoreDisplay = new ModernScoreDisplay( this.currentTheme );
    this.container.addChild( this.scoreDisplay.container );
  }

  private createMiniMap (): void
  {
    this.miniMap = new MiniMap( this.currentTheme );
    this.container.addChild( this.miniMap.container );
  }

  private createPauseScreen (): void
  {
    this.pauseScreen = new PauseScreen( this.currentTheme );
    this.container.addChild( this.pauseScreen.container );
  }

  private createGameOverScreen (): void
  {
    this.gameOverScreen = new GameOverScreen( this.currentTheme );
    this.container.addChild( this.gameOverScreen.container );
  }

  private setupResponsiveLayout (): void
  {
    // Adapt to different screen sizes
    const scale = Math.min( window.innerWidth / GAME_CONFIG.CANVAS_WIDTH, window.innerHeight / GAME_CONFIG.CANVAS_HEIGHT );
    if ( scale < 1 )
    {
      this.container.scale.set( scale );
    }
  }

  // Public interface methods
  public updateScore ( score: number, level: number ): void
  {
    this.scoreDisplay.updateScore( score, level );
    this.statusBar.updateScore( score );
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateBackground();
    this.gameGrid.updateTheme( theme );
    this.statusBar.updateTheme( theme );
    this.scoreDisplay.updateTheme( theme );
    this.miniMap.updateTheme( theme );
    this.pauseScreen.updateTheme( theme );
    this.gameOverScreen.updateTheme( theme );
  }

  public showGameOver ( score: number, isNewRecord: boolean, onRestart: () => void ): void
  {
    this.gameOverScreen.show( score, isNewRecord, onRestart );
  }

  public hideGameOver (): void
  {
    this.gameOverScreen.hide();
  }

  public showPause (): void
  {
    this.pauseScreen.show();
  }

  public hidePause (): void
  {
    this.pauseScreen.hide();
  }

  public updateMiniMap ( snakeBody: Position[], food: Position, obstacles: Position[] ): void
  {
    this.miniMap.update( snakeBody, food, obstacles );
  }

  public update ( deltaTime: number ): void
  {
    this.scoreDisplay.update( deltaTime );
    this.statusBar.update( deltaTime );
    this.miniMap.update();
  }
}

// Modern score display with animations
class ModernScoreDisplay
{
  public container: Container;
  private scoreText!: Text;
  private levelText!: Text;
  private background!: Graphics;
  private pulseAnimation: any;
  private currentTheme: any;

  constructor ( theme: any )
  {
    this.container = new Container();
    this.currentTheme = theme;

    this.createBackground();
    this.createText();
    this.setupAnimations();

    this.container.x = 20;
    this.container.y = 20;
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.updateBackground();
    this.container.addChild( this.background );
  }

  private updateBackground (): void
  {
    this.background.clear();

    // Modern glass morphism effect
    this.background.beginFill( this.currentTheme.background, 0.8 );
    this.background.lineStyle( 2, this.currentTheme.primary, 0.5 );
    this.background.drawRoundedRect( 0, 0, 200, 80, 15 );
    this.background.endFill();

    // Inner glow
    this.background.beginFill( this.currentTheme.primary, 0.1 );
    this.background.drawRoundedRect( 2, 2, 196, 76, 13 );
    this.background.endFill();
  }

  private createText (): void
  {
    const scoreStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: this.currentTheme.primary,
      letterSpacing: 1,
    } );

    const levelStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fill: this.currentTheme.text,
      letterSpacing: 0.5,
    } );

    this.scoreText = new Text( 'Score: 0', scoreStyle );
    this.scoreText.x = 15;
    this.scoreText.y = 15;

    this.levelText = new Text( 'Level: 1', levelStyle );
    this.levelText.x = 15;
    this.levelText.y = 45;

    this.container.addChild( this.scoreText );
    this.container.addChild( this.levelText );
  }

  private setupAnimations (): void
  {
    this.pulseAnimation = AnimationUtils.createPulse( 1, 0.05, 0.02 );
  }

  public updateScore ( score: number, level: number ): void
  {
    this.scoreText.text = `Score: ${ score.toLocaleString() }`;
    this.levelText.text = `Level: ${ level }`;

    // Trigger pulse animation on score change
    this.pulseAnimation = AnimationUtils.createPulse( 1, 0.1, 0.1 );
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateBackground();

    // Update text colors
    this.scoreText.style.fill = theme.primary;
    this.levelText.style.fill = theme.text;
  }

  public update ( deltaTime: number ): void
  {
    const scale = this.pulseAnimation.update( deltaTime );
    this.container.scale.set( scale );
  }
}

// Status bar with game information
class StatusBar
{
  public container: Container;
  private background!: Graphics;
  private modeText!: Text;
  private timeText!: Text;
  private currentTheme: any;
  private gameTime: number = 0;

  constructor ( theme: any )
  {
    this.container = new Container();
    this.currentTheme = theme;

    this.createBackground();
    this.createText();

    this.container.x = GAME_CONFIG.CANVAS_WIDTH - 250;
    this.container.y = 20;
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.updateBackground();
    this.container.addChild( this.background );
  }

  private updateBackground (): void
  {
    this.background.clear();

    this.background.beginFill( this.currentTheme.background, 0.8 );
    this.background.lineStyle( 2, this.currentTheme.accent, 0.5 );
    this.background.drawRoundedRect( 0, 0, 230, 60, 15 );
    this.background.endFill();
  }

  private createText (): void
  {
    const textStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: this.currentTheme.text,
      letterSpacing: 0.5,
    } );

    this.modeText = new Text( 'Mode: Classic', textStyle );
    this.modeText.x = 15;
    this.modeText.y = 10;

    this.timeText = new Text( 'Time: 0:00', textStyle );
    this.timeText.x = 15;
    this.timeText.y = 30;

    this.container.addChild( this.modeText );
    this.container.addChild( this.timeText );
  }

  public updateScore ( _score: number ): void
  {
    // Additional status updates can go here
  }

  public updateMode ( mode: string ): void
  {
    this.modeText.text = `Mode: ${ mode }`;
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateBackground();

    this.modeText.style.fill = theme.text;
    this.timeText.style.fill = theme.text;
  }

  public update ( deltaTime: number ): void
  {
    this.gameTime += deltaTime / 60; // Convert to seconds
    const minutes = Math.floor( this.gameTime / 60 );
    const seconds = Math.floor( this.gameTime % 60 );
    this.timeText.text = `Time: ${ minutes }:${ seconds.toString().padStart( 2, '0' ) }`;
  }

  public resetTime (): void
  {
    this.gameTime = 0;
  }
}

// Modern game grid with enhanced visuals
class GameGrid
{
  public container: Container;
  private gridLines!: Graphics;
  private currentTheme: any;

  constructor ( theme: any )
  {
    this.container = new Container();
    this.currentTheme = theme;

    this.createGrid();
  }

  private createGrid (): void
  {
    this.gridLines = new Graphics();
    this.updateGrid();
    this.container.addChild( this.gridLines );
  }

  private updateGrid (): void
  {
    this.gridLines.clear();

    // Subtle grid lines for modern look
    this.gridLines.lineStyle( 1, this.currentTheme.grid, 0.2 );

    // Vertical lines
    for ( let x = 0; x <= GAME_CONFIG.CANVAS_WIDTH; x += GAME_CONFIG.GRID_SIZE )
    {
      this.gridLines.moveTo( x, 0 );
      this.gridLines.lineTo( x, GAME_CONFIG.CANVAS_HEIGHT );
    }

    // Horizontal lines
    for ( let y = 0; y <= GAME_CONFIG.CANVAS_HEIGHT; y += GAME_CONFIG.GRID_SIZE )
    {
      this.gridLines.moveTo( 0, y );
      this.gridLines.lineTo( GAME_CONFIG.CANVAS_WIDTH, y );
    }
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateGrid();
  }
}

// Mini-map for better game awareness
class MiniMap
{
  public container: Container;
  private background!: Graphics;
  private mapGraphics!: Graphics;
  private currentTheme: any;
  private scale: number = 0.15;

  constructor ( theme: any )
  {
    this.container = new Container();
    this.currentTheme = theme;

    this.createBackground();
    this.createMapGraphics();

    this.container.x = GAME_CONFIG.CANVAS_WIDTH - 150;
    this.container.y = GAME_CONFIG.CANVAS_HEIGHT - 120;
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.updateBackground();
    this.container.addChild( this.background );
  }

  private updateBackground (): void
  {
    this.background.clear();

    this.background.beginFill( this.currentTheme.background, 0.9 );
    this.background.lineStyle( 2, this.currentTheme.accent, 0.7 );
    this.background.drawRoundedRect( 0, 0, 130, 100, 10 );
    this.background.endFill();
  }

  private createMapGraphics (): void
  {
    this.mapGraphics = new Graphics();
    this.container.addChild( this.mapGraphics );
  }

  public update ( snakeBody?: Position[], food?: Position, obstacles?: Position[] ): void
  {
    this.mapGraphics.clear();

    if ( snakeBody )
    {
      // Draw snake
      this.mapGraphics.beginFill( this.currentTheme.primary );
      snakeBody.forEach( segment =>
      {
        this.mapGraphics.drawRect(
          10 + segment.x * this.scale,
          10 + segment.y * this.scale,
          this.scale * GAME_CONFIG.GRID_SIZE,
          this.scale * GAME_CONFIG.GRID_SIZE
        );
      } );
      this.mapGraphics.endFill();
    }

    if ( food )
    {
      // Draw food
      this.mapGraphics.beginFill( this.currentTheme.secondary );
      this.mapGraphics.drawRect(
        10 + food.x * GAME_CONFIG.GRID_SIZE * this.scale,
        10 + food.y * GAME_CONFIG.GRID_SIZE * this.scale,
        this.scale * GAME_CONFIG.GRID_SIZE,
        this.scale * GAME_CONFIG.GRID_SIZE
      );
      this.mapGraphics.endFill();
    }

    if ( obstacles )
    {
      // Draw obstacles
      this.mapGraphics.beginFill( this.currentTheme.text, 0.7 );
      obstacles.forEach( obstacle =>
      {
        this.mapGraphics.drawRect(
          10 + obstacle.x * GAME_CONFIG.GRID_SIZE * this.scale,
          10 + obstacle.y * GAME_CONFIG.GRID_SIZE * this.scale,
          this.scale * GAME_CONFIG.GRID_SIZE,
          this.scale * GAME_CONFIG.GRID_SIZE
        );
      } );
      this.mapGraphics.endFill();
    }
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateBackground();
  }
}

// Modern pause screen
class PauseScreen
{
  public container: Container;
  private background!: Graphics;
  private titleText!: Text;
  private instructionText!: Text;
  private currentTheme: any;

  constructor ( theme: any )
  {
    this.container = new Container();
    this.currentTheme = theme;
    this.container.visible = false;

    this.createBackground();
    this.createText();
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.updateBackground();
    this.container.addChild( this.background );
  }

  private updateBackground (): void
  {
    this.background.clear();

    // Semi-transparent overlay
    this.background.beginFill( 0x000000, 0.7 );
    this.background.drawRect( 0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT );
    this.background.endFill();

    // Central panel
    const panelX = GAME_CONFIG.CANVAS_WIDTH / 2 - 200;
    const panelY = GAME_CONFIG.CANVAS_HEIGHT / 2 - 100;

    this.background.beginFill( this.currentTheme.background, 0.95 );
    this.background.lineStyle( 3, this.currentTheme.primary, 0.8 );
    this.background.drawRoundedRect( panelX, panelY, 400, 200, 20 );
    this.background.endFill();
  }

  private createText (): void
  {
    const titleStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 36,
      fontWeight: 'bold',
      fill: this.currentTheme.primary,
      letterSpacing: 2,
    } );

    const instructionStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      fill: this.currentTheme.text,
      align: 'center',
    } );

    this.titleText = new Text( 'PAUSED', titleStyle );
    this.titleText.anchor.set( 0.5 );
    this.titleText.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.titleText.y = GAME_CONFIG.CANVAS_HEIGHT / 2 - 30;

    this.instructionText = new Text( 'Press SPACE or P to resume', instructionStyle );
    this.instructionText.anchor.set( 0.5 );
    this.instructionText.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.instructionText.y = GAME_CONFIG.CANVAS_HEIGHT / 2 + 20;

    this.container.addChild( this.titleText );
    this.container.addChild( this.instructionText );
  }

  public show (): void
  {
    this.container.visible = true;
  }

  public hide (): void
  {
    this.container.visible = false;
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateBackground();
    this.titleText.style.fill = theme.primary;
    this.instructionText.style.fill = theme.text;
  }
}

// Modern game over screen
class GameOverScreen
{
  public container: Container;
  private background!: Graphics;
  private titleText!: Text;
  private scoreText!: Text;
  private recordText!: Text;
  private instructionText!: Text;
  private currentTheme: any;

  constructor ( theme: any )
  {
    this.container = new Container();
    this.currentTheme = theme;
    this.container.visible = false;

    this.createBackground();
    this.createText();
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.updateBackground();
    this.container.addChild( this.background );
  }

  private updateBackground (): void
  {
    this.background.clear();

    // Semi-transparent overlay
    this.background.beginFill( 0x000000, 0.8 );
    this.background.drawRect( 0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT );
    this.background.endFill();

    // Central panel
    const panelX = GAME_CONFIG.CANVAS_WIDTH / 2 - 250;
    const panelY = GAME_CONFIG.CANVAS_HEIGHT / 2 - 150;

    this.background.beginFill( this.currentTheme.background, 0.95 );
    this.background.lineStyle( 3, this.currentTheme.secondary, 0.8 );
    this.background.drawRoundedRect( panelX, panelY, 500, 300, 25 );
    this.background.endFill();
  }

  private createText (): void
  {
    const titleStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 42,
      fontWeight: 'bold',
      fill: this.currentTheme.secondary,
      letterSpacing: 3,
    } );

    const scoreStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fill: this.currentTheme.primary,
      letterSpacing: 1,
    } );

    const recordStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: this.currentTheme.accent,
      letterSpacing: 1,
    } );

    const instructionStyle = new TextStyle( {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fill: this.currentTheme.text,
      align: 'center',
    } );

    this.titleText = new Text( 'GAME OVER', titleStyle );
    this.titleText.anchor.set( 0.5 );
    this.titleText.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.titleText.y = GAME_CONFIG.CANVAS_HEIGHT / 2 - 80;

    this.scoreText = new Text( 'Final Score: 0', scoreStyle );
    this.scoreText.anchor.set( 0.5 );
    this.scoreText.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.scoreText.y = GAME_CONFIG.CANVAS_HEIGHT / 2 - 30;

    this.recordText = new Text( '', recordStyle );
    this.recordText.anchor.set( 0.5 );
    this.recordText.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.recordText.y = GAME_CONFIG.CANVAS_HEIGHT / 2 + 10;

    this.instructionText = new Text( 'Press R to restart', instructionStyle );
    this.instructionText.anchor.set( 0.5 );
    this.instructionText.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.instructionText.y = GAME_CONFIG.CANVAS_HEIGHT / 2 + 60;

    this.container.addChild( this.titleText );
    this.container.addChild( this.scoreText );
    this.container.addChild( this.recordText );
    this.container.addChild( this.instructionText );
  }

  public show ( score: number, isNewRecord: boolean, onRestart: () => void ): void
  {
    this.scoreText.text = `Final Score: ${ score.toLocaleString() }`;
    this.recordText.text = isNewRecord ? '🏆 NEW RECORD! 🏆' : '';
    this.recordText.visible = isNewRecord;

    this.container.visible = true;

    // Add restart functionality
    const restartHandler = ( event: KeyboardEvent ) =>
    {
      if ( event.code === 'KeyR' )
      {
        this.hide();
        onRestart();
        window.removeEventListener( 'keydown', restartHandler );
      }
    };

    window.addEventListener( 'keydown', restartHandler );
  }

  public hide (): void
  {
    this.container.visible = false;
  }

  public updateTheme ( theme: any ): void
  {
    this.currentTheme = theme;
    this.updateBackground();
    this.titleText.style.fill = theme.secondary;
    this.scoreText.style.fill = theme.primary;
    this.recordText.style.fill = theme.accent;
    this.instructionText.style.fill = theme.text;
  }
} 