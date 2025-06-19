import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ThemeManager } from './theme-manager';

export class ThemeToggleButton
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
    this.button.position.set( 640, 20 );
    this.button.interactive = true;
    this.container.addChild( this.button );

    const style = new TextStyle( {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#fff',
      align: 'center',
    } );
    this.label = new Text( 'Theme: Dark', style );
    this.label.anchor.set( 0.5 );
    this.label.position.set( 80, 20 );
    this.button.addChild( this.label );

    this.button.on( 'pointertap', () =>
    {
      ThemeManager.nextTheme();
    } );

    ThemeManager.onThemeChange( theme =>
    {
      this.label.text = `Theme: ${ theme.name }`;
    } );
  }
} 