import { StorageUtils } from '../utils/helpers';
import { GAME_MODES, COLOR_PALETTES, GameMode } from '../utils/constants';

// Settings interface
export interface GameSettings
{
  // Display settings
  theme: string;
  fullscreen: boolean;
  showFPS: boolean;
  enableParticles: boolean;
  particleQuality: 'low' | 'medium' | 'high';

  // Game settings
  gameMode: GameMode;
  difficulty: 'easy' | 'normal' | 'hard';
  gridSize: number;
  snakeSpeed: number;
  enablePowerUps: boolean;
  enableObstacles: boolean;

  // Control settings
  keyboardControls: {
    up: string;
    down: string;
    left: string;
    right: string;
    pause: string;
    restart: string;
  };
  touchControls: boolean;
  swipeSensitivity: number;

  // Audio settings (kept for future use)
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  enableSFX: boolean;
  enableMusic: boolean;

  // Accessibility
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reduceMotion: boolean;

  // Data settings
  saveHighScores: boolean;
  analytics: boolean;
  autoSave: boolean;
}

// High score entry
export interface HighScoreEntry
{
  score: number;
  level: number;
  gameMode: GameMode;
  date: string;
  duration: number; // in seconds
  playerName?: string;
}

// Statistics
export interface GameStatistics
{
  totalGamesPlayed: number;
  totalScore: number;
  totalPlayTime: number; // in seconds
  averageScore: number;
  highestScore: number;
  longestGame: number; // in seconds
  totalFoodEaten: number;
  totalPowerUpsCollected: number;
  totalAchievementsUnlocked: number;
  gamesPerMode: Record<GameMode, number>;
  favoriteGameMode: GameMode;
  firstPlayDate: string;
  lastPlayDate: string;
}

// Default settings
const DEFAULT_SETTINGS: GameSettings = {
  // Display
  theme: 'dark',
  fullscreen: false,
  showFPS: false,
  enableParticles: true,
  particleQuality: 'medium',

  // Game
  gameMode: GAME_MODES.CLASSIC,
  difficulty: 'normal',
  gridSize: 20,
  snakeSpeed: 6,
  enablePowerUps: true,
  enableObstacles: true,

  // Controls
  keyboardControls: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    pause: 'Space',
    restart: 'KeyR',
  },
  touchControls: true,
  swipeSensitivity: 30,

  // Audio
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  enableSFX: true,
  enableMusic: true,

  // Accessibility
  highContrast: false,
  colorBlindMode: 'none',
  reduceMotion: false,

  // Data
  saveHighScores: true,
  analytics: true,
  autoSave: true,
};

const DEFAULT_STATISTICS: GameStatistics = {
  totalGamesPlayed: 0,
  totalScore: 0,
  totalPlayTime: 0,
  averageScore: 0,
  highestScore: 0,
  longestGame: 0,
  totalFoodEaten: 0,
  totalPowerUpsCollected: 0,
  totalAchievementsUnlocked: 0,
  gamesPerMode: {
    [ GAME_MODES.CLASSIC ]: 0,
    [ GAME_MODES.TIME_ATTACK ]: 0,
    [ GAME_MODES.OBSTACLE_COURSE ]: 0,
    [ GAME_MODES.SURVIVAL ]: 0,
    [ GAME_MODES.SPEED_RUN ]: 0,
  },
  favoriteGameMode: GAME_MODES.CLASSIC,
  firstPlayDate: new Date().toISOString(),
  lastPlayDate: new Date().toISOString(),
};

export class SettingsManager
{
  private static instance: SettingsManager;
  private settings!: GameSettings;
  private statistics!: GameStatistics;
  private highScores: HighScoreEntry[] = [];
  private listeners: Map<string, ( ( value: any ) => void )[]> = new Map();

  private constructor ()
  {
    this.loadSettings();
    this.loadStatistics();
    this.loadHighScores();
  }

  public static getInstance (): SettingsManager
  {
    if ( !SettingsManager.instance )
    {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  // Settings management
  private loadSettings (): void
  {
    this.settings = StorageUtils.load( 'snake_settings', DEFAULT_SETTINGS );

    // Merge with defaults in case new settings were added
    this.settings = { ...DEFAULT_SETTINGS, ...this.settings };
  }

  private saveSettings (): void
  {
    if ( this.settings.autoSave )
    {
      StorageUtils.save( 'snake_settings', this.settings );
    }
  }

  public getSettings (): GameSettings
  {
    return { ...this.settings };
  }

  public getSetting<K extends keyof GameSettings> ( key: K ): GameSettings[ K ]
  {
    return this.settings[ key ];
  }

  public setSetting<K extends keyof GameSettings> ( key: K, value: GameSettings[ K ] ): void
  {
    this.settings[ key ] = value;
    this.saveSettings();
    this.notifyListeners( key, value );
  }

  public resetSettings (): void
  {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();

    // Notify all listeners
    for ( const key in this.settings )
    {
      this.notifyListeners( key as keyof GameSettings, this.settings[ key as keyof GameSettings ] );
    }
  }

  // Statistics management
  private loadStatistics (): void
  {
    this.statistics = StorageUtils.load( 'snake_statistics', DEFAULT_STATISTICS );
  }

  private saveStatistics (): void
  {
    StorageUtils.save( 'snake_statistics', this.statistics );
  }

  public getStatistics (): GameStatistics
  {
    return this.statistics;
  }

  public updateStatistics ( updates: Partial<GameStatistics> ): void
  {
    Object.assign( this.statistics, updates );
    this.statistics.lastPlayDate = new Date().toISOString();
    this.saveStatistics();
  }

  public recordGameEnd ( score: number, _level: number, gameMode: GameMode, duration: number ): void
  {
    this.statistics.totalGamesPlayed++;
    this.statistics.totalScore += score;
    this.statistics.totalPlayTime += duration;
    this.statistics.gamesPerMode[ gameMode ]++;

    if ( score > this.statistics.highestScore )
    {
      this.statistics.highestScore = score;
    }

    if ( duration > this.statistics.longestGame )
    {
      this.statistics.longestGame = duration;
    }

    this.statistics.averageScore = this.statistics.totalScore / this.statistics.totalGamesPlayed;

    // Update favorite game mode
    const mostPlayedMode = Object.entries( this.statistics.gamesPerMode )
      .reduce( ( a, b ) => a[ 1 ] > b[ 1 ] ? a : b )[ 0 ] as GameMode;
    this.statistics.favoriteGameMode = mostPlayedMode;

    this.saveStatistics();
  }

  // High scores management
  private loadHighScores (): void
  {
    this.highScores = StorageUtils.load( 'snake_highscores', [] );
  }

  private saveHighScores (): void
  {
    if ( this.settings.saveHighScores )
    {
      StorageUtils.save( 'snake_highscores', this.highScores );
    }
  }

  public addHighScore ( entry: Omit<HighScoreEntry, 'date'> ): boolean
  {
    const newEntry: HighScoreEntry = {
      ...entry,
      date: new Date().toISOString(),
    };

    this.highScores.push( newEntry );
    this.highScores.sort( ( a, b ) => b.score - a.score );

    // Keep only top 100 scores
    this.highScores = this.highScores.slice( 0, 100 );

    this.saveHighScores();

    // Return true if this score made it to top 10
    const topScores = this.getTopScores( 10 );
    return topScores.some( score => score.date === newEntry.date );
  }

  public getHighScores (): HighScoreEntry[]
  {
    return [ ...this.highScores ];
  }

  public getTopScores ( count: number = 10 ): HighScoreEntry[]
  {
    return this.highScores.slice( 0, count );
  }

  public getScoresByMode ( gameMode: GameMode, count: number = 10 ): HighScoreEntry[]
  {
    return this.highScores
      .filter( entry => entry.gameMode === gameMode )
      .slice( 0, count );
  }

  public clearHighScores (): void
  {
    this.highScores = [];
    this.saveHighScores();
  }

  public isNewRecord ( score: number, gameMode?: GameMode ): boolean
  {
    if ( gameMode )
    {
      const modeScores = this.getScoresByMode( gameMode, 1 );
      return modeScores.length === 0 || score > modeScores[ 0 ].score;
    }

    return this.highScores.length === 0 || score > this.highScores[ 0 ].score;
  }

  // Event system for settings changes
  public addEventListener<K extends keyof GameSettings> (
    setting: K,
    callback: ( value: GameSettings[ K ] ) => void
  ): void
  {
    if ( !this.listeners.has( setting ) )
    {
      this.listeners.set( setting, [] );
    }
    this.listeners.get( setting )!.push( callback );
  }

  public removeEventListener<K extends keyof GameSettings> (
    setting: K,
    callback: ( value: GameSettings[ K ] ) => void
  ): void
  {
    const listeners = this.listeners.get( setting );
    if ( listeners )
    {
      const index = listeners.indexOf( callback );
      if ( index > -1 )
      {
        listeners.splice( index, 1 );
      }
    }
  }

  private notifyListeners<K extends keyof GameSettings> (
    setting: K,
    value: GameSettings[ K ]
  ): void
  {
    const listeners = this.listeners.get( setting );
    if ( listeners )
    {
      listeners.forEach( callback => callback( value ) );
    }
  }

  // Import/Export settings
  public exportSettings (): string
  {
    return JSON.stringify( {
      settings: this.settings,
      statistics: this.statistics,
      highScores: this.highScores,
      exportDate: new Date().toISOString(),
    }, null, 2 );
  }

  public importSettings ( data: string ): boolean
  {
    try
    {
      const imported = JSON.parse( data );

      if ( imported.settings )
      {
        this.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
        this.saveSettings();
      }

      if ( imported.statistics )
      {
        this.statistics = { ...DEFAULT_STATISTICS, ...imported.statistics };
        this.saveStatistics();
      }

      if ( imported.highScores && Array.isArray( imported.highScores ) )
      {
        this.highScores = imported.highScores;
        this.saveHighScores();
      }

      return true;
    } catch ( error )
    {
      console.error( 'Failed to import settings:', error );
      return false;
    }
  }

  // Utility methods
  public getThemeColors ()
  {
    const themeName = this.settings.theme.toUpperCase() as keyof typeof COLOR_PALETTES;
    return COLOR_PALETTES[ themeName ] || COLOR_PALETTES.DARK;
  }

  public isHighContrastEnabled (): boolean
  {
    return this.settings.highContrast;
  }

  public isReducedMotionEnabled (): boolean
  {
    return this.settings.reduceMotion;
  }

  public getParticleQuality (): 'low' | 'medium' | 'high'
  {
    return this.settings.particleQuality;
  }

  // Migration methods for future versions
  public migrateSettings ( fromVersion: string, toVersion: string ): void
  {
    console.log( `Migrating settings from ${ fromVersion } to ${ toVersion }` );
    // Future migration logic would go here
  }
} 