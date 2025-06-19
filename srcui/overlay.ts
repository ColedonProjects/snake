import { Container, Text, TextStyle, Graphics } from 'pixi.js';
// Sound system removed

export class OverlayUI
{
  public container: Container;
  private scoreText: Text;
  private levelText: Text;
  private gameOverText: Text;
  private restartButton: Graphics;
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
    this.restartButton.beginFill( 0x4444ff );
    this.restartButton.drawRoundedRect( 0, 0, 200, 60, 8 );
    this.restartButton.endFill();
    this.restartButton.position.set( 300, 320 );
    this.restartButton.interactive = true;
    this.restartButton.visible = false;
    this.container.addChild( this.restartButton );

    const restartText = new Text( 'Click to Restart', {
      ...style,
      fontSize: 24,
      fill: '#fff',
    } );
    restartText.anchor.set( 0.5 );
    restartText.position.set( 100, 30 );
    this.restartButton.addChild( restartText );

    this.restartButton.on( 'pointertap', () =>
    {
      console.log( '[OverlayUI] Restart button clicked' );
      if ( this.onRestart )
      {
        this.onRestart();
      }
    } );
  }

  public updateScore ( score: number ): void
  {
    this.scoreText.text = `Score: ${ score }`;
  }

  public updateLevel ( level: number ): void
  {
    this.levelText.text = `Level: ${ level }`;
  }

  public showGameOver ( onRestart: () => void ): void
  {
    console.log( '[OverlayUI] Showing game over screen' );
    this.gameOverText.visible = true;
    this.restartButton.visible = true;
    this.onRestart = onRestart;
  }

  public hideGameOver (): void
  {
    console.log( '[OverlayUI] Hiding game over screen' );
    this.gameOverText.visible = false;
    this.restartButton.visible = false;
    this.onRestart = null;
  }
} 