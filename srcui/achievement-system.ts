import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SoundManager, SoundEffect } from '../src/audio/sound-manager';

export interface Achievement
{
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export class AchievementSystem
{
  public container: Container;
  private popupContainer!: Container;
  private achievements: Achievement[] = [];
  private popup!: Graphics;
  private popupText!: Text;
  private popupDesc!: Text;
  private popupTimer: number = 0;
  private popupDuration: number = 180; // 3 seconds
  private soundManager: SoundManager;

  constructor ()
  {
    this.container = new Container();
    this.soundManager = SoundManager.getInstance();
    this.initializeAchievements();
    this.createPopup();
    this.loadProgress();
  }

  private initializeAchievements ()
  {
    this.achievements = [
      { id: 'first_100', name: 'Getting Started', description: 'Score 100 points', unlocked: false, progress: 0, target: 100 },
      { id: 'first_500', name: 'Snake Master', description: 'Score 500 points', unlocked: false, progress: 0, target: 500 },
      { id: 'first_1000', name: 'Legend', description: 'Score 1000 points', unlocked: false, progress: 0, target: 1000 },
      { id: 'combo_master', name: 'Combo Master', description: 'Get 3 combo bonuses', unlocked: false, progress: 0, target: 3 },
      { id: 'power_collector', name: 'Power Collector', description: 'Collect 5 power-ups', unlocked: false, progress: 0, target: 5 },
      { id: 'survivor', name: 'Survivor', description: 'Survive for 2 minutes', unlocked: false, progress: 0, target: 7200 }, // 120 seconds * 60 fps
      { id: 'no_walls', name: 'Wall Dodger', description: 'Play for 1 minute without hitting walls', unlocked: false, progress: 0, target: 3600 },
    ];
  }

  private createPopup ()
  {
    this.popupContainer = new Container();
    this.popup = new Graphics();
    this.popup.beginFill( 0x333333, 0.9 );
    this.popup.drawRoundedRect( 0, 0, 400, 120, 12 );
    this.popup.endFill();
    this.popup.position.set( 200, 50 );
    this.popup.visible = false;
    this.popupContainer.addChild( this.popup );

    const titleStyle = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffdd44',
      align: 'center',
      fontWeight: 'bold',
    } );
    this.popupText = new Text( 'Achievement Unlocked!', titleStyle );
    this.popupText.anchor.set( 0.5 );
    this.popupText.position.set( 200, 30 );
    this.popup.addChild( this.popupText );

    const descStyle = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#ffffff',
      align: 'center',
    } );
    this.popupDesc = new Text( '', descStyle );
    this.popupDesc.anchor.set( 0.5 );
    this.popupDesc.position.set( 200, 70 );
    this.popup.addChild( this.popupDesc );

    this.container.addChild( this.popupContainer );
  }

  updateScore ( score: number )
  {
    this.checkAchievement( 'first_100', score );
    this.checkAchievement( 'first_500', score );
    this.checkAchievement( 'first_1000', score );
  }

  updateComboCount ()
  {
    const achievement = this.achievements.find( a => a.id === 'combo_master' );
    if ( achievement && !achievement.unlocked )
    {
      achievement.progress++;
      this.checkAchievement( 'combo_master', achievement.progress );
    }
  }

  updatePowerUpCount ()
  {
    const achievement = this.achievements.find( a => a.id === 'power_collector' );
    if ( achievement && !achievement.unlocked )
    {
      achievement.progress++;
      this.checkAchievement( 'power_collector', achievement.progress );
    }
  }

  updateSurvivalTime ()
  {
    const survivorAchievement = this.achievements.find( a => a.id === 'survivor' );
    const wallAchievement = this.achievements.find( a => a.id === 'no_walls' );
    if ( survivorAchievement && !survivorAchievement.unlocked )
    {
      survivorAchievement.progress++;
      this.checkAchievement( 'survivor', survivorAchievement.progress );
    }
    if ( wallAchievement && !wallAchievement.unlocked )
    {
      wallAchievement.progress++;
      this.checkAchievement( 'no_walls', wallAchievement.progress );
    }
  }

  onWallHit ()
  {
    const achievement = this.achievements.find( a => a.id === 'no_walls' );
    if ( achievement && !achievement.unlocked )
    {
      achievement.progress = 0; // Reset progress on wall hit
    }
  }

  resetGameSession ()
  {
    // Reset session-based achievements
    const wallAchievement = this.achievements.find( a => a.id === 'no_walls' );
    const survivorAchievement = this.achievements.find( a => a.id === 'survivor' );
    if ( wallAchievement && !wallAchievement.unlocked ) wallAchievement.progress = 0;
    if ( survivorAchievement && !survivorAchievement.unlocked ) survivorAchievement.progress = 0;
  }

  private checkAchievement ( id: string, progress: number )
  {
    const achievement = this.achievements.find( a => a.id === id );
    if ( achievement && !achievement.unlocked && progress >= achievement.target )
    {
      achievement.unlocked = true;
      this.showAchievement( achievement );
      this.saveProgress();
    }
  }

  private showAchievement ( achievement: Achievement )
  {
    this.popupText.text = 'Achievement Unlocked!';
    this.popupDesc.text = `${ achievement.name }: ${ achievement.description }`;
    this.popup.visible = true;
    this.popupTimer = this.popupDuration;
    this.soundManager.play( SoundEffect.ACHIEVEMENT );
    console.log( `[Achievement] Unlocked: ${ achievement.name }` );
  }

  update ()
  {
    if ( this.popup.visible )
    {
      this.popupTimer--;
      if ( this.popupTimer < 30 )
      {
        this.popup.alpha = this.popupTimer / 30;
      }
      if ( this.popupTimer <= 0 )
      {
        this.popup.visible = false;
        this.popup.alpha = 1;
      }
    }
  }

  private saveProgress ()
  {
    localStorage.setItem( 'snake_achievements', JSON.stringify( this.achievements ) );
  }

  private loadProgress ()
  {
    const saved = localStorage.getItem( 'snake_achievements' );
    if ( saved )
    {
      const savedAchievements = JSON.parse( saved );
      for ( const saved of savedAchievements )
      {
        const existing = this.achievements.find( a => a.id === saved.id );
        if ( existing )
        {
          existing.unlocked = saved.unlocked;
          existing.progress = saved.progress;
        }
      }
    }
  }
} 