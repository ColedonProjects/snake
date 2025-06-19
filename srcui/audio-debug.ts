import { Container, Graphics, Text } from 'pixi.js';
import { SoundManager, SoundEffect } from '../src/audio/sound-manager';

export class AudioDebugPanel
{
  public container: Container;
  private background!: Graphics;
  private statusText!: Text;
  private triggerButton!: Graphics;
  private triggerButtonText!: Text;
  private soundManager: SoundManager;

  constructor ()
  {
    this.container = new Container();
    this.soundManager = SoundManager.getInstance();

    this.createBackground();
    this.createStatusText();
    this.createTriggerButton();
    this.updateDisplay();

    // Update every second
    setInterval( () => this.updateDisplay(), 1000 );
  }

  private createBackground (): void
  {
    this.background = new Graphics();
    this.background.beginFill( 0x000000, 0.7 );
    this.background.drawRect( 0, 0, 300, 120 );
    this.background.endFill();
    this.container.addChild( this.background );

    // Position in top-right corner
    this.container.x = window.innerWidth - 320;
    this.container.y = 20;
  }

  private createStatusText (): void
  {
    this.statusText = new Text( 'Audio Debug', {
      fill: 0xffffff,
      fontSize: 12,
      fontFamily: 'Arial'
    } );
    this.statusText.x = 10;
    this.statusText.y = 10;
    this.container.addChild( this.statusText );
  }

  private createTriggerButton (): void
  {
    this.triggerButton = new Graphics();
    this.triggerButton.beginFill( 0x4CAF50 );
    this.triggerButton.drawRect( 0, 0, 120, 30 );
    this.triggerButton.endFill();
    this.triggerButton.x = 10;
    this.triggerButton.y = 80;
    this.triggerButton.eventMode = 'static';
    this.triggerButton.cursor = 'pointer';

    this.triggerButtonText = new Text( 'Enable Audio', {
      fill: 0xffffff,
      fontSize: 10,
      fontFamily: 'Arial'
    } );
    this.triggerButtonText.x = 15;
    this.triggerButtonText.y = 10;
    this.triggerButton.addChild( this.triggerButtonText );

    this.triggerButton.on( 'pointerdown', () =>
    {
      console.log( '[AudioDebug] Manual audio trigger clicked' );

      // Trigger a click event to initialize audio
      document.dispatchEvent( new Event( 'click' ) );

      // Also try to play a test sound
      setTimeout( () =>
      {
        this.soundManager.play( SoundEffect.BUTTON_CLICK );
      }, 100 );
    } );

    this.container.addChild( this.triggerButton );
  }

  private updateDisplay (): void
  {
    const state = this.soundManager.getState() as any;

    const statusLines = [
      'Audio Debug',
      `Initialized: ${ state.audioInitialized }`,
      `User Interacted: ${ state.isUserInteracted }`,
      `Audio Context: ${ state.audioContextState || 'none' }`,
      `Howler Context: ${ state.howlerCtxState || 'none' }`,
      `Pending Sounds: ${ state.pendingSounds }`
    ];

    this.statusText.text = statusLines.join( '\n' );

    // Update button color based on state
    this.triggerButton.clear();
    const color = state.audioInitialized ? 0x4CAF50 : 0xF44336;
    this.triggerButton.beginFill( color );
    this.triggerButton.drawRect( 0, 0, 120, 30 );
    this.triggerButton.endFill();

    this.triggerButtonText.text = state.audioInitialized ? 'Audio Ready' : 'Enable Audio';
  }

  public setVisible ( visible: boolean ): void
  {
    this.container.visible = visible;
  }
} 