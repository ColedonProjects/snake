import { Application } from 'pixi.js';
import { Game } from './core/game';
import { CookieManager } from './utils/cookie-manager';

// Create external UI manager
class ExternalUI
{
  private scoreElement: HTMLElement;
  private levelElement: HTMLElement;
  private themeButton: HTMLElement;
  private skinButton: HTMLElement;
  private achievementsList: HTMLElement;
  private startButton: HTMLElement;
  private gameStatusElement: HTMLElement;
  private gamesPlayedElement: HTMLElement;
  private highScoreElement: HTMLElement;
  private averageScoreElement: HTMLElement;
  private game: Game | null = null;

  // Popover elements
  private settingsTrigger: HTMLElement;
  private achievementsTrigger: HTMLElement;
  private instructionsTrigger: HTMLElement;
  private settingsPopover: HTMLElement;
  private achievementsPopover: HTMLElement;
  private instructionsPopover: HTMLElement;
  private popoverBackdrop: HTMLElement;

  constructor ()
  {
    this.scoreElement = document.getElementById( 'score-display' )!;
    this.levelElement = document.getElementById( 'level-display' )!;
    this.themeButton = document.getElementById( 'theme-button' )!;
    this.skinButton = document.getElementById( 'skin-button' )!;
    this.achievementsList = document.getElementById( 'achievements-list' )!;
    this.startButton = document.getElementById( 'start-button' )!;
    this.gameStatusElement = document.getElementById( 'game-status' )!;
    this.gamesPlayedElement = document.getElementById( 'games-played' )!;
    this.highScoreElement = document.getElementById( 'high-score' )!;
    this.averageScoreElement = document.getElementById( 'average-score' )!;

    // Popover elements
    this.settingsTrigger = document.getElementById( 'settings-trigger' )!;
    this.achievementsTrigger = document.getElementById( 'achievements-trigger' )!;
    this.instructionsTrigger = document.getElementById( 'instructions-trigger' )!;
    this.settingsPopover = document.getElementById( 'settings-popover' )!;
    this.achievementsPopover = document.getElementById( 'achievements-popover' )!;
    this.instructionsPopover = document.getElementById( 'instructions-popover' )!;
    this.popoverBackdrop = document.getElementById( 'popover-backdrop' )!;

    console.log( '[ExternalUI] Elements found:', {
      score: !!this.scoreElement,
      level: !!this.levelElement,
      theme: !!this.themeButton,
      skin: !!this.skinButton,
      achievements: !!this.achievementsList,
      start: !!this.startButton,
      status: !!this.gameStatusElement,
      gamesPlayed: !!this.gamesPlayedElement,
      highScore: !!this.highScoreElement,
      averageScore: !!this.averageScoreElement,
      settingsTrigger: !!this.settingsTrigger,
      achievementsTrigger: !!this.achievementsTrigger,
      instructionsTrigger: !!this.instructionsTrigger
    } );

    // Set up popover functionality
    this.setupPopovers();

    // Load and display initial statistics
    this.updateStatistics();

    // Show welcome message for first-time players
    if ( CookieManager.isFirstTime() )
    {
      console.log( '[ExternalUI] Welcome new player!' );
    }
  }

  private setupPopovers (): void
  {
    // Settings popover
    this.settingsTrigger.addEventListener( 'click', ( e ) =>
    {
      e.stopPropagation();
      this.togglePopover( 'settings' );
    } );

    // Achievements popover
    this.achievementsTrigger.addEventListener( 'click', ( e ) =>
    {
      e.stopPropagation();
      this.togglePopover( 'achievements' );
    } );

    // Instructions popover
    this.instructionsTrigger.addEventListener( 'click', ( e ) =>
    {
      e.stopPropagation();
      this.togglePopover( 'instructions' );
    } );

    // Backdrop and outside clicks
    this.popoverBackdrop.addEventListener( 'click', () =>
    {
      this.closeAllPopovers();
    } );

    // Close popovers when clicking outside
    document.addEventListener( 'click', ( e ) =>
    {
      const target = e.target as HTMLElement;
      if ( !target.closest( '.popover' ) && !target.closest( '.icon-button' ) )
      {
        this.closeAllPopovers();
      }
    } );

    // Close popovers on escape key
    document.addEventListener( 'keydown', ( e ) =>
    {
      if ( e.key === 'Escape' )
      {
        this.closeAllPopovers();
      }
    } );
  }

  private togglePopover ( type: 'settings' | 'achievements' | 'instructions' ): void
  {
    const isSettingsOpen = this.settingsPopover.classList.contains( 'active' );
    const isAchievementsOpen = this.achievementsPopover.classList.contains( 'active' );
    const isInstructionsOpen = this.instructionsPopover.classList.contains( 'active' );

    // Close all popovers first
    this.closeAllPopovers();

    // Open the requested popover if it wasn't already open
    if ( type === 'settings' && !isSettingsOpen )
    {
      this.settingsPopover.classList.add( 'active' );
      this.popoverBackdrop.classList.add( 'active' );
    } else if ( type === 'achievements' && !isAchievementsOpen )
    {
      this.achievementsPopover.classList.add( 'active' );
      this.popoverBackdrop.classList.add( 'active' );
    } else if ( type === 'instructions' && !isInstructionsOpen )
    {
      this.instructionsPopover.classList.add( 'active' );
      this.popoverBackdrop.classList.add( 'active' );
    }
  }

  private closeAllPopovers (): void
  {
    this.settingsPopover.classList.remove( 'active' );
    this.achievementsPopover.classList.remove( 'active' );
    this.instructionsPopover.classList.remove( 'active' );
    this.popoverBackdrop.classList.remove( 'active' );
  }

  setGame ( game: Game ): void
  {
    console.log( '[ExternalUI] Setting game reference' );
    this.game = game;
    this.setupEventListeners();
  }

  private setupEventListeners (): void
  {
    console.log( '[ExternalUI] Setting up event listeners' );

    // Start button
    this.startButton.addEventListener( 'click', () =>
    {
      console.log( '[ExternalUI] Start button clicked' );
      if ( this.game )
      {
        this.game.start();
        this.startButton.textContent = 'Restart Game';
      } else
      {
        console.warn( '[ExternalUI] Game reference not set!' );
      }
    } );

    // Theme button
    this.themeButton.addEventListener( 'click', () =>
    {
      console.log( '[ExternalUI] Theme button clicked' );
      if ( this.game )
      {
        this.game.nextTheme();
      } else
      {
        console.warn( '[ExternalUI] Game reference not set!' );
      }
    } );

    // Skin button
    this.skinButton.addEventListener( 'click', () =>
    {
      console.log( '[ExternalUI] Skin button clicked' );
      if ( this.game )
      {
        this.game.nextSkin();
      } else
      {
        console.warn( '[ExternalUI] Game reference not set!' );
      }
    } );
  }

  updateScore ( score: number ): void
  {
    this.scoreElement.textContent = score.toString();

    // Check for new high score during gameplay
    if ( CookieManager.updateHighScore( score ) )
    {
      this.updateStatistics();
      console.log( '[ExternalUI] New high score achieved!', score );
    }
  }

  updateLevel ( level: number ): void
  {
    this.levelElement.textContent = level.toString();
  }

  updateTheme ( themeName: string ): void
  {
    this.themeButton.textContent = themeName;
  }

  updateSkin ( skinName: string ): void
  {
    this.skinButton.textContent = skinName;
  }

  updateGameStatus ( status: 'ready' | 'playing' | 'paused' | 'game-over' ): void
  {
    this.gameStatusElement.className = 'game-status';

    switch ( status )
    {
      case 'ready':
        this.gameStatusElement.textContent = 'Ready to Play';
        break;
      case 'playing':
        this.gameStatusElement.textContent = 'Playing';
        this.gameStatusElement.classList.add( 'playing' );
        break;
      case 'paused':
        this.gameStatusElement.textContent = 'Paused';
        this.gameStatusElement.classList.add( 'paused' );
        break;
      case 'game-over':
        this.gameStatusElement.textContent = 'Game Over';
        break;
    }
  }

  gameCompleted ( finalScore: number ): void
  {
    // Record the completed game in cookies
    const newStats = CookieManager.recordGame( finalScore );
    this.updateStatistics();

    console.log( '[ExternalUI] Game completed. Final score:', finalScore );
    console.log( '[ExternalUI] Updated stats:', newStats );
  }

  private updateStatistics (): void
  {
    const stats = CookieManager.getFormattedStats();
    this.gamesPlayedElement.textContent = stats.gamesPlayed;
    this.highScoreElement.textContent = stats.highestScore;
    this.averageScoreElement.textContent = stats.averageScore;
  }

  unlockAchievement ( achievementName: string ): void
  {
    const badges = this.achievementsList.querySelectorAll( '.achievement-badge' );
    badges.forEach( badge =>
    {
      if ( badge.getAttribute( 'data-achievement' ) === achievementName )
      {
        badge.classList.add( 'unlocked' );
        console.log( `[ExternalUI] Achievement unlocked: ${ achievementName }` );
      }
    } );
  }

  updateAchievements ( achievements: string[] ): void
  {
    const badges = this.achievementsList.querySelectorAll( '.achievement-badge' );
    badges.forEach( badge =>
    {
      const achievementName = badge.getAttribute( 'data-achievement' );
      if ( achievementName && achievements.includes( achievementName ) )
      {
        badge.classList.add( 'unlocked' );
      }
    } );
  }
}

// Initialize everything when DOM is ready
function initializeGame ()
{
  console.log( '[Main] Initializing game...' );

  // Create the Pixi application
  const app = new Application( {
    width: 800,
    height: 600,
    backgroundColor: 0x000000,
    antialias: true,
  } );

  // Add the canvas to the DOM
  const gameContainer = document.getElementById( 'game-container' );
  if ( !gameContainer )
  {
    console.error( '[Main] Game container not found!' );
    return;
  }
  gameContainer.appendChild( app.view as HTMLCanvasElement );

  // Create external UI instance
  const externalUI = new ExternalUI();

  // Create the game but don't start it yet
  const game = new Game( app, externalUI );
  externalUI.setGame( game );

  console.log( '[Main] Game initialization complete' );
}

// Wait for DOM to be ready
if ( document.readyState === 'loading' )
{
  document.addEventListener( 'DOMContentLoaded', initializeGame );
} else
{
  initializeGame();
} 