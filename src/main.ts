import { Application } from 'pixi.js';
import { Game } from './core/game';
import { CookieManager } from './utils/cookie-manager';

// Handles all UI elements outside the game canvas
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

  // Elements for the popup dialogs
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

    // Get popup dialog elements
    this.settingsTrigger = document.getElementById( 'settings-trigger' )!;
    this.achievementsTrigger = document.getElementById( 'achievements-trigger' )!;
    this.instructionsTrigger = document.getElementById( 'instructions-trigger' )!;
    this.settingsPopover = document.getElementById( 'settings-popover' )!;
    this.achievementsPopover = document.getElementById( 'achievements-popover' )!;
    this.instructionsPopover = document.getElementById( 'instructions-popover' )!;
    this.popoverBackdrop = document.getElementById( 'popover-backdrop' )!;

    // Verify all UI elements were found successfully

    // Initialize popup dialog functionality
    this.setupPopovers();

    // Load and display saved game statistics
    this.updateStatistics();

    // Log message for new players
    if ( CookieManager.isFirstTime() )
    {
      // First-time player detected
    }
  }

  private setupPopovers (): void
  {
    // Handle settings dialog
    this.settingsTrigger.addEventListener( 'click', ( e ) =>
    {
      e.stopPropagation();
      this.togglePopover( 'settings' );
    } );

    // Handle achievements dialog
    this.achievementsTrigger.addEventListener( 'click', ( e ) =>
    {
      e.stopPropagation();
      this.togglePopover( 'achievements' );
    } );

    // Handle instructions dialog
    this.instructionsTrigger.addEventListener( 'click', ( e ) =>
    {
      e.stopPropagation();
      this.togglePopover( 'instructions' );
    } );

    // Close dialog when clicking backdrop
    this.popoverBackdrop.addEventListener( 'click', () =>
    {
      this.closeAllPopovers();
    } );

    // Also close when clicking outside dialogs
    document.addEventListener( 'click', ( e ) =>
    {
      const target = e.target as HTMLElement;
      if ( !target.closest( '.popover' ) && !target.closest( '.icon-button' ) )
      {
        this.closeAllPopovers();
      }
    } );

    // Close dialogs with Escape key
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

    // Close any open dialogs first
    this.closeAllPopovers();

    // Show the requested dialog if it wasn't already visible
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
    this.game = game;
    this.setupEventListeners();
  }

  private setupEventListeners (): void
  {

    // Start button
    this.startButton.addEventListener( 'click', () =>
    {
      if ( this.game )
      {
        this.game.start();
        this.startButton.textContent = 'Restart Game';
      }
    } );

    // Theme button
    this.themeButton.addEventListener( 'click', () =>
    {
      if ( this.game )
      {
        this.game.nextTheme();
      }
    } );

    // Skin button
    this.skinButton.addEventListener( 'click', () =>
    {
      if ( this.game )
      {
        this.game.nextSkin();
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
    CookieManager.recordGame( finalScore );
    this.updateStatistics();
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
        // Achievement unlocked and displayed
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
}

// Wait for DOM to be ready
if ( document.readyState === 'loading' )
{
  document.addEventListener( 'DOMContentLoaded', initializeGame );
} else
{
  initializeGame();
} 