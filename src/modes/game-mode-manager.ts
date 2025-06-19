import { GAME_MODES, GameMode } from '../utils/constants';
import { GameState } from '../types/game-state';

// Base interface for all game modes
export interface IGameMode
{
  readonly name: string;
  readonly description: string;
  readonly timeLimit?: number; // in seconds, undefined for unlimited
  readonly hasObstacles: boolean;
  readonly hasTimeLimit: boolean;
  readonly speedMultiplier: number;

  // Game mode specific logic
  onGameStart (): void;
  onFoodEaten ( score: number, level: number ): { bonus: number; speedChange?: number; };
  onLevelUp ( level: number ): { obstacleChange?: number; speedChange?: number; };
  onUpdate ( gameState: GameState, deltaTime: number ): void;
  onGameEnd ( score: number, timeElapsed: number ): void;
  shouldGameEnd ( gameState: GameState, timeElapsed: number ): boolean;
  getScoreMultiplier ( level: number ): number;
  getInitialObstacleCount ( level: number ): number;
}

// Classic Mode - Traditional snake gameplay
export class ClassicMode implements IGameMode
{
  readonly name = 'Classic';
  readonly description = 'Traditional snake game with increasing difficulty';
  readonly hasObstacles = true;
  readonly hasTimeLimit = false;
  readonly speedMultiplier = 1.0;

  onGameStart (): void
  {
    console.log( '[ClassicMode] Game started' );
  }

  onFoodEaten ( _score: number, _level: number ): { bonus: number; speedChange?: number; }
  {
    return { bonus: 0 }; // No special bonus in classic mode
  }

  onLevelUp ( level: number ): { obstacleChange?: number; speedChange?: number; }
  {
    return {
      obstacleChange: Math.min( 2 + level, 20 ), // Gradually increase obstacles
      speedChange: 1 + ( level - 1 ) * 0.15, // Moderate speed increase
    };
  }

  onUpdate ( _gameState: GameState, _deltaTime: number ): void
  {
    // No special updates for classic mode
  }

  onGameEnd ( score: number, timeElapsed: number ): void
  {
    console.log( `[ClassicMode] Game ended - Score: ${ score }, Time: ${ timeElapsed }s` );
  }

  shouldGameEnd ( gameState: GameState, _timeElapsed: number ): boolean
  {
    return gameState.isGameOver; // Only end on collision/death
  }

  getScoreMultiplier ( level: number ): number
  {
    return 1 + ( level - 1 ) * 0.1; // Small bonus for higher levels
  }

  getInitialObstacleCount ( level: number ): number
  {
    return Math.min( 2 + level, 15 );
  }
}

// Time Attack Mode - Race against the clock
export class TimeAttackMode implements IGameMode
{
  readonly name = 'Time Attack';
  readonly description = 'Score as many points as possible in 2 minutes';
  readonly timeLimit = 120; // 2 minutes
  readonly hasObstacles = false;
  readonly hasTimeLimit = true;
  readonly speedMultiplier = 1.5;

  private timeRemaining: number = 120;

  onGameStart (): void
  {
    this.timeRemaining = this.timeLimit!;
    console.log( '[TimeAttackMode] 2-minute challenge started!' );
  }

  onFoodEaten ( _score: number, _level: number ): { bonus: number; speedChange?: number; }
  {
    // Bonus points for quick eating
    const timeBonus = Math.floor( ( this.timeLimit! - ( this.timeLimit! - this.timeRemaining ) ) / 10 );
    return { bonus: timeBonus };
  }

  onLevelUp ( level: number ): { obstacleChange?: number; speedChange?: number; }
  {
    return {
      obstacleChange: 0, // No obstacles in time attack
      speedChange: this.speedMultiplier + ( level - 1 ) * 0.1,
    };
  }

  onUpdate ( _gameState: GameState, deltaTime: number ): void
  {
    this.timeRemaining -= deltaTime / 60; // Convert to seconds
  }

  onGameEnd ( score: number, _timeElapsed: number ): void
  {
    console.log( `[TimeAttackMode] Time's up! Final score: ${ score }` );
  }

  shouldGameEnd ( gameState: GameState, _timeElapsed: number ): boolean
  {
    return gameState.isGameOver || this.timeRemaining <= 0;
  }

  getScoreMultiplier ( _level: number ): number
  {
    return 2.0; // Double points for time pressure
  }

  getInitialObstacleCount ( _level: number ): number
  {
    return 0; // No obstacles
  }

  getTimeRemaining (): number
  {
    return Math.max( 0, this.timeRemaining );
  }
}

// Obstacle Course Mode - Navigate through complex obstacle patterns
export class ObstacleCourseMode implements IGameMode
{
  readonly name = 'Obstacle Course';
  readonly description = 'Navigate through increasingly complex obstacle patterns';
  readonly hasObstacles = true;
  readonly hasTimeLimit = false;
  readonly speedMultiplier = 0.8; // Slower to allow precision

  onGameStart (): void
  {
    console.log( '[ObstacleCourseMode] Navigate the obstacles!' );
  }

  onFoodEaten ( _score: number, level: number ): { bonus: number; speedChange?: number; }
  {
    // Bonus for navigating obstacles successfully
    return { bonus: level * 5 };
  }

  onLevelUp ( level: number ): { obstacleChange?: number; speedChange?: number; }
  {
    return {
      obstacleChange: 5 + level * 3, // Many more obstacles
      speedChange: this.speedMultiplier + ( level - 1 ) * 0.05, // Gradual speed increase
    };
  }

  onUpdate ( _gameState: GameState, _deltaTime: number ): void
  {
    // Could add moving obstacles in the future
  }

  onGameEnd ( score: number, _timeElapsed: number ): void
  {
    console.log( `[ObstacleCourseMode] Course completed! Score: ${ score }` );
  }

  shouldGameEnd ( gameState: GameState, _timeElapsed: number ): boolean
  {
    return gameState.isGameOver;
  }

  getScoreMultiplier ( level: number ): number
  {
    return 1.5 + ( level - 1 ) * 0.2; // Higher rewards for difficulty
  }

  getInitialObstacleCount ( level: number ): number
  {
    return Math.min( 8 + level * 2, 35 );
  }
}

// Survival Mode - Endless gameplay with increasing difficulty
export class SurvivalMode implements IGameMode
{
  readonly name = 'Survival';
  readonly description = 'How long can you survive the endless challenge?';
  readonly hasObstacles = true;
  readonly hasTimeLimit = false;
  readonly speedMultiplier = 1.0;

  private difficultyTimer: number = 0;
  private difficultyLevel: number = 1;

  onGameStart (): void
  {
    this.difficultyTimer = 0;
    this.difficultyLevel = 1;
    console.log( '[SurvivalMode] Survive as long as possible!' );
  }

  onFoodEaten ( _score: number, _level: number ): { bonus: number; speedChange?: number; }
  {
    return {
      bonus: this.difficultyLevel * 2,
      speedChange: 1 + this.difficultyLevel * 0.1,
    };
  }

  onLevelUp ( _level: number ): { obstacleChange?: number; speedChange?: number; }
  {
    return {
      obstacleChange: Math.min( 3 + this.difficultyLevel * 2, 25 ),
      speedChange: 1 + this.difficultyLevel * 0.1,
    };
  }

  onUpdate ( _gameState: GameState, deltaTime: number ): void
  {
    this.difficultyTimer += deltaTime;

    // Increase difficulty every 30 seconds
    if ( this.difficultyTimer >= 1800 )
    { // 30 seconds at 60fps
      this.difficultyLevel++;
      this.difficultyTimer = 0;
      console.log( `[SurvivalMode] Difficulty increased to level ${ this.difficultyLevel }` );
    }
  }

  onGameEnd ( _score: number, timeElapsed: number ): void
  {
    console.log( `[SurvivalMode] Survived ${ timeElapsed }s at difficulty ${ this.difficultyLevel }` );
  }

  shouldGameEnd ( gameState: GameState, _timeElapsed: number ): boolean
  {
    return gameState.isGameOver;
  }

  getScoreMultiplier ( _level: number ): number
  {
    return 1 + this.difficultyLevel * 0.25;
  }

  getInitialObstacleCount ( _level: number ): number
  {
    return Math.min( 5 + this.difficultyLevel, 30 );
  }

  getDifficultyLevel (): number
  {
    return this.difficultyLevel;
  }
}

// Speed Run Mode - Fast-paced gameplay for quick sessions
export class SpeedRunMode implements IGameMode
{
  readonly name = 'Speed Run';
  readonly description = 'Race to 500 points as fast as possible';
  readonly hasObstacles = false;
  readonly hasTimeLimit = false;
  readonly speedMultiplier = 2.5;

  private targetScore = 500;

  onGameStart (): void
  {
    console.log( `[SpeedRunMode] Race to ${ this.targetScore } points!` );
  }

  onFoodEaten ( score: number, _level: number ): { bonus: number; speedChange?: number; }
  {
    // Escalating bonus for maintaining momentum
    const momentum = Math.floor( score / 50 );
    return {
      bonus: momentum * 2,
      speedChange: this.speedMultiplier + momentum * 0.1,
    };
  }

  onLevelUp ( level: number ): { obstacleChange?: number; speedChange?: number; }
  {
    return {
      obstacleChange: 0,
      speedChange: this.speedMultiplier + level * 0.2,
    };
  }

  onUpdate ( _gameState: GameState, _deltaTime: number ): void
  {
    // No special updates
  }

  onGameEnd ( score: number, timeElapsed: number ): void
  {
    if ( score >= this.targetScore )
    {
      console.log( `[SpeedRunMode] Target reached in ${ timeElapsed }s!` );
    } else
    {
      console.log( `[SpeedRunMode] Game ended at ${ score }/${ this.targetScore } points` );
    }
  }

  shouldGameEnd ( gameState: GameState, _timeElapsed: number ): boolean
  {
    return gameState.isGameOver || gameState.score >= this.targetScore;
  }

  getScoreMultiplier ( _level: number ): number
  {
    return 1.5; // Fixed bonus for speed
  }

  getInitialObstacleCount ( _level: number ): number
  {
    return 0; // No obstacles for pure speed
  }

  getTargetScore (): number
  {
    return this.targetScore;
  }

  getProgress ( currentScore: number ): number
  {
    return Math.min( currentScore / this.targetScore, 1.0 );
  }
}

// Game Mode Manager
export class GameModeManager
{
  private modes: Map<GameMode, IGameMode> = new Map();
  private currentMode: IGameMode;

  constructor ()
  {
    // Register all game modes
    this.modes.set( GAME_MODES.CLASSIC, new ClassicMode() );
    this.modes.set( GAME_MODES.TIME_ATTACK, new TimeAttackMode() );
    this.modes.set( GAME_MODES.OBSTACLE_COURSE, new ObstacleCourseMode() );
    this.modes.set( GAME_MODES.SURVIVAL, new SurvivalMode() );
    this.modes.set( GAME_MODES.SPEED_RUN, new SpeedRunMode() );

    // Default to classic mode
    this.currentMode = this.modes.get( GAME_MODES.CLASSIC )!;
  }

  setMode ( mode: GameMode ): boolean
  {
    const gameMode = this.modes.get( mode );
    if ( gameMode )
    {
      this.currentMode = gameMode;
      console.log( `[GameModeManager] Switched to ${ gameMode.name } mode` );
      return true;
    }
    return false;
  }

  getCurrentMode (): IGameMode
  {
    return this.currentMode;
  }

  getAllModes (): IGameMode[]
  {
    return Array.from( this.modes.values() );
  }

  getModeByName ( name: string ): IGameMode | undefined
  {
    return Array.from( this.modes.values() ).find( mode => mode.name === name );
  }

  getNextMode (): GameMode | null
  {
    const modeKeys = Array.from( this.modes.keys() );
    const currentIndex = modeKeys.findIndex( key => this.modes.get( key ) === this.currentMode );
    const nextIndex = ( currentIndex + 1 ) % modeKeys.length;
    return modeKeys[ nextIndex ];
  }

  getPreviousMode (): GameMode | null
  {
    const modeKeys = Array.from( this.modes.keys() );
    const currentIndex = modeKeys.findIndex( key => this.modes.get( key ) === this.currentMode );
    const prevIndex = currentIndex === 0 ? modeKeys.length - 1 : currentIndex - 1;
    return modeKeys[ prevIndex ];
  }
} 