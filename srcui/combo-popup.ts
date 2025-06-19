import { Container, Text, TextStyle } from 'pixi.js';

export class ComboPopup
{
  public container: Container;
  private popupText: Text;
  private timer: number = 0;
  private duration: number = 60; // frames

  constructor ()
  {
    this.container = new Container();
    const style = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 40,
      fill: '#ffe066',
      stroke: '#000',
      strokeThickness: 5,
      align: 'center',
      dropShadow: true,
      dropShadowColor: '#333',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    } );
    this.popupText = new Text( '', style );
    this.popupText.anchor.set( 0.5 );
    this.popupText.position.set( 400, 100 );
    this.popupText.visible = false;
    this.container.addChild( this.popupText );
  }

  show ( message: string )
  {
    this.popupText.text = message;
    this.popupText.visible = true;
    this.timer = this.duration;
    this.popupText.alpha = 1;
  }

  update ()
  {
    if ( this.popupText.visible )
    {
      this.timer--;
      if ( this.timer < 20 )
      {
        this.popupText.alpha = this.timer / 20;
      }
      if ( this.timer <= 0 )
      {
        this.popupText.visible = false;
      }
    }
  }
} 