import { Container, Graphics } from 'pixi.js';

interface Particle
{
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
}

export class ParticleSystem
{
  public container: Container;
  private particles: Particle[] = [];

  constructor ()
  {
    this.container = new Container();
  }

  burstAt ( x: number, y: number, color: number = 0xffff00, count: number = 18 )
  {
    for ( let i = 0; i < count; i++ )
    {
      const angle = ( Math.PI * 2 * i ) / count + Math.random() * 0.2;
      const speed = 2 + Math.random() * 2;
      const vx = Math.cos( angle ) * speed;
      const vy = Math.sin( angle ) * speed;
      const gfx = new Graphics();
      gfx.beginFill( color );
      gfx.drawCircle( 0, 0, 3 + Math.random() * 2 );
      gfx.endFill();
      gfx.x = x;
      gfx.y = y;
      this.container.addChild( gfx );
      this.particles.push( { gfx, vx, vy, life: 30 + Math.random() * 10 } );
    }
  }

  update ()
  {
    for ( let i = this.particles.length - 1; i >= 0; i-- )
    {
      const p = this.particles[ i ];
      p.gfx.x += p.vx;
      p.gfx.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
      p.gfx.alpha = Math.max( 0, p.life / 40 );
      if ( p.life <= 0 )
      {
        this.container.removeChild( p.gfx );
        p.gfx.destroy();
        this.particles.splice( i, 1 );
      }
    }
  }
} 