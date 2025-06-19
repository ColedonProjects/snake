import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SoundManager, SoundEffect } from '../src/audio/sound-manager';

export class OverlayUI
{
  public container: Container;
  private scoreText: Text;
  private levelText: Text;
  private gameOverText: Text;
  private restartButton: Graphics;
  private audioTestButton: Graphics;
  private onRestart: ( () => void ) | null = null;

  constructor ()
  {
    this.container = new Container();

    const style = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 4,
    } );

    this.scoreText = new Text( 'Score: 0', style );
    this.scoreText.position.set( 20, 10 );
    this.container.addChild( this.scoreText );

    this.levelText = new Text( 'Level: 1', style );
    this.levelText.position.set( 650, 10 );
    this.container.addChild( this.levelText );

    // Audio test button
    this.audioTestButton = new Graphics();
    this.audioTestButton.beginFill( 0x44aa44 );
    this.audioTestButton.drawRoundedRect( 0, 0, 120, 40, 8 );
    this.audioTestButton.endFill();
    this.audioTestButton.position.set( 20, 60 );
    this.audioTestButton.interactive = true;
    this.container.addChild( this.audioTestButton );

    const audioTestText = new Text( 'Test Audio', {
      ...style,
      fontSize: 18,
      fill: '#fff',
    } );
    audioTestText.anchor.set( 0.5 );
    audioTestText.position.set( 60, 20 );
    this.audioTestButton.addChild( audioTestText );

    this.audioTestButton.on( 'pointertap', () =>
    {
      console.log( '[OverlayUI] Audio test button clicked' );
      const soundManager = SoundManager.getInstance();
      soundManager.play( SoundEffect.EAT );
    } );

    this.gameOverText = new Text( 'GAME OVER', {
      ...style,
      fontSize: 48,
      fill: '#ff4444',
      align: 'center',
    } );
    this.gameOverText.anchor.set( 0.5 );
    this.gameOverText.position.set( 400, 250 );
    this.gameOverText.visible = false;
    this.container.addChild( this.gameOverText );

    this.restartButton = new Graphics();
    this.restartButton.beginFill( 0x2222ff );
    this.restartButton.drawRoundedRect( 0, 0, 180, 50, 12 );
    this.restartButton.endFill();
    this.restartButton.position.set( 310, 320 );
    this.restartButton.interactive = true;
    this.restartButton.visible = false;
    this.container.addChild( this.restartButton );

    const restartText = new Text( 'Restart', {
      ...style,
      fontSize: 28,
      fill: '#fff',
    } );
    restartText.anchor.set( 0.5 );
    restartText.position.set( 90, 25 );
    this.restartButton.addChild( restartText );

    this.restartButton.on( 'pointertap', () =>
    {
      if ( this.onRestart ) this.onRestart();
    } );
  }

  public updateScore ( score: number )
  {
    this.scoreText.text = `Score: ${ score }`;
  }

  public updateLevel ( level: number )
  {
    this.levelText.text = `Level: ${ level }`;
  }

  public showGameOver ( onRestart: () => void )
  {
    this.gameOverText.visible = true;
    this.restartButton.visible = true;
    this.onRestart = onRestart;
  }

  public hideGameOver ()
  {
    this.gameOverText.visible = false;
    this.restartButton.visible = false;
    this.onRestart = null;
  }
} 