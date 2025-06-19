import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SkinManager } from './skin-manager';

export class SkinToggleButton
{
  public container: Container;
  private button: Graphics;
  private label: Text;

  constructor ()
  {
    this.container = new Container();
    this.button = new Graphics();
    this.button.beginFill( 0x444444, 0.8 );
    this.button.drawRoundedRect( 0, 0, 160, 40, 12 );
    this.button.endFill();
    this.button.position.set( 640, 70 );
    this.button.interactive = true;
    this.container.addChild( this.button );

    const style = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#fff',
      align: 'center',
    } );
    this.label = new Text( 'Skin: Classic', style );
    this.label.anchor.set( 0.5 );
    this.label.position.set( 80, 20 );
    this.button.addChild( this.label );

    this.button.on( 'pointertap', () =>
    {
      SkinManager.nextSkin();
    } );

    SkinManager.onSkinChange( skin =>
    {
      this.label.text = `Skin: ${ skin.name }`;
    } );
  }
} 