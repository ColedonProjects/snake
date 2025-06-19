import { Container, Graphics, BlurFilter, ColorMatrixFilter } from 'pixi.js';
import { GAME_CONFIG } from '../utils/constants';
import { Position, MathUtils, ColorUtils, PerformanceUtils } from '../utils/helpers';

// Enhanced particle interface with more properties
interface EnhancedParticle
{
  gfx: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  initialSize: number;
  color: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  bounce: number;
  trail: Position[];
  type: ParticleType;
}

export enum ParticleType
{
  EXPLOSION = 'explosion',
  SPARKLE = 'sparkle',
  SMOKE = 'smoke',
  FIRE = 'fire',
  ELECTRIC = 'electric',
  MAGIC = 'magic',
  CONFETTI = 'confetti',
  SNOW = 'snow',
}

export interface ParticleConfig
{
  position: Position;
  count: number;
  color: number;
  type: ParticleType;
  intensity?: number;
  duration?: number;
  velocity?: number;
  spread?: number;
  gravity?: number;
  size?: number;
}

export class EnhancedParticleSystem
{
  public container: Container;
  private particles: EnhancedParticle[] = [];
  private particlePool: {
    get: () => EnhancedParticle;
    release: ( obj: EnhancedParticle ) => void;
    getPoolSize: () => number;
  };
  private blurFilter: BlurFilter;
  private colorFilter: ColorMatrixFilter;
  private isEnabled: boolean = true;

  constructor ()
  {
    this.container = new Container();

    // Create object pool for performance
    this.particlePool = PerformanceUtils.createObjectPool(
      () => this.createParticleObject(),
      ( particle ) => this.resetParticle( particle ),
      GAME_CONFIG.PARTICLE_POOL_SIZE
    );

    // Add visual filters for enhanced effects
    this.blurFilter = new BlurFilter( 1 );
    this.colorFilter = new ColorMatrixFilter();

    this.container.filters = [ this.blurFilter, this.colorFilter ];
  }

  private createParticleObject (): EnhancedParticle
  {
    const gfx = new Graphics();
    return {
      gfx,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      size: 0,
      initialSize: 0,
      color: 0xFFFFFF,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0,
      bounce: 0,
      trail: [],
      type: ParticleType.EXPLOSION,
    };
  }

  private resetParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.clear();
    particle.trail.length = 0;
    this.container.removeChild( particle.gfx );
  }

  // Enhanced burst with multiple particle types and effects
  public createBurst ( config: ParticleConfig ): void
  {
    if ( !this.isEnabled ) return;

    const {
      position,
      count = GAME_CONFIG.PARTICLE_COUNT,
      color = 0xFFFF00,
      type = ParticleType.EXPLOSION,
      intensity = 1.0,
      duration = GAME_CONFIG.PARTICLE_LIFETIME,
      velocity = 3,
      spread = Math.PI * 2,
      gravity = 0.1,
      size = 3,
    } = config;

    for ( let i = 0; i < count; i++ )
    {
      const particle = this.particlePool.get() as EnhancedParticle;

      // Position
      particle.x = position.x;
      particle.y = position.y;

      // Velocity with spread
      const angle = ( spread * i ) / count + MathUtils.randomRange( -0.2, 0.2 );
      const speed = velocity * MathUtils.randomRange( 0.5, 1.5 ) * intensity;
      particle.vx = Math.cos( angle ) * speed;
      particle.vy = Math.sin( angle ) * speed;

      // Life and appearance
      particle.life = duration + MathUtils.randomRange( -10, 10 );
      particle.maxLife = particle.life;
      particle.size = size * MathUtils.randomRange( 0.5, 1.5 );
      particle.initialSize = particle.size;
      particle.color = this.getVariatedColor( color, type );

      // Rotation
      particle.rotation = MathUtils.randomRange( 0, Math.PI * 2 );
      particle.rotationSpeed = MathUtils.randomRange( -0.2, 0.2 );

      // Physics
      particle.gravity = gravity * MathUtils.randomRange( 0.8, 1.2 );
      particle.bounce = MathUtils.randomRange( 0.3, 0.7 );

      // Type
      particle.type = type;

      // Create visual representation
      this.updateParticleGraphics( particle );
      this.container.addChild( particle.gfx );
      this.particles.push( particle );
    }
  }

  private getVariatedColor ( baseColor: number, type: ParticleType ): number
  {
    switch ( type )
    {
      case ParticleType.FIRE:
        // Vary between red, orange, and yellow
        const fireColors = [ 0xFF4444, 0xFF8844, 0xFFFF44 ];
        return fireColors[ Math.floor( Math.random() * fireColors.length ) ];

      case ParticleType.ELECTRIC:
        // Electric blue variations
        return ColorUtils.blendColors( 0x00FFFF, 0xFFFFFF, Math.random() * 0.5 );

      case ParticleType.MAGIC:
        // Purple/pink/blue magic colors
        const magicColors = [ 0xFF44FF, 0x8844FF, 0x44FFFF ];
        return magicColors[ Math.floor( Math.random() * magicColors.length ) ];

      case ParticleType.CONFETTI:
        // Random bright colors
        return ColorUtils.randomColor();

      case ParticleType.SMOKE:
        // Grayscale variations
        const gray = MathUtils.randomInt( 60, 160 );
        return ColorUtils.rgbToHex( gray, gray, gray );

      default:
        // Slight variation of base color
        return ColorUtils.blendColors( baseColor, ColorUtils.randomColor(), 0.1 );
    }
  }

  private updateParticleGraphics ( particle: EnhancedParticle ): void
  {
    particle.gfx.clear();
    particle.gfx.x = particle.x;
    particle.gfx.y = particle.y;
    particle.gfx.rotation = particle.rotation;

    const alpha = particle.life / particle.maxLife;
    particle.gfx.alpha = alpha;

    switch ( particle.type )
    {
      case ParticleType.EXPLOSION:
        this.drawExplosionParticle( particle );
        break;

      case ParticleType.SPARKLE:
        this.drawSparkleParticle( particle );
        break;

      case ParticleType.FIRE:
        this.drawFireParticle( particle );
        break;

      case ParticleType.ELECTRIC:
        this.drawElectricParticle( particle );
        break;

      case ParticleType.MAGIC:
        this.drawMagicParticle( particle );
        break;

      case ParticleType.CONFETTI:
        this.drawConfettiParticle( particle );
        break;

      case ParticleType.SMOKE:
        this.drawSmokeParticle( particle );
        break;

      default:
        this.drawDefaultParticle( particle );
    }
  }

  private drawExplosionParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.beginFill( particle.color );
    particle.gfx.drawCircle( 0, 0, particle.size );
    particle.gfx.endFill();
  }

  private drawSparkleParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.lineStyle( 1, particle.color );
    const size = particle.size;
    particle.gfx.moveTo( -size, 0 );
    particle.gfx.lineTo( size, 0 );
    particle.gfx.moveTo( 0, -size );
    particle.gfx.lineTo( 0, size );
    particle.gfx.moveTo( -size * 0.7, -size * 0.7 );
    particle.gfx.lineTo( size * 0.7, size * 0.7 );
    particle.gfx.moveTo( -size * 0.7, size * 0.7 );
    particle.gfx.lineTo( size * 0.7, -size * 0.7 );
  }

  private drawFireParticle ( particle: EnhancedParticle ): void
  {
    // Create flame-like shape
    particle.gfx.beginFill( particle.color );
    const size = particle.size;
    particle.gfx.drawEllipse( 0, 0, size, size * 1.5 );
    particle.gfx.endFill();
  }

  private drawElectricParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.lineStyle( 2, particle.color );
    const size = particle.size;
    // Draw lightning-like zigzag
    let x = 0, y = -size;
    particle.gfx.moveTo( x, y );
    for ( let i = 0; i < 3; i++ )
    {
      x += MathUtils.randomRange( -size * 0.5, size * 0.5 );
      y += size * 0.7;
      particle.gfx.lineTo( x, y );
    }
  }

  private drawMagicParticle ( particle: EnhancedParticle ): void
  {
    // Draw glowing orb with outer glow
    particle.gfx.beginFill( particle.color, 0.8 );
    particle.gfx.drawCircle( 0, 0, particle.size );
    particle.gfx.endFill();

    // Outer glow
    particle.gfx.beginFill( particle.color, 0.3 );
    particle.gfx.drawCircle( 0, 0, particle.size * 2 );
    particle.gfx.endFill();
  }

  private drawConfettiParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.beginFill( particle.color );
    particle.gfx.drawRect( -particle.size, -particle.size * 0.5, particle.size * 2, particle.size );
    particle.gfx.endFill();
  }

  private drawSmokeParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.beginFill( particle.color, 0.6 );
    particle.gfx.drawCircle( 0, 0, particle.size * 2 );
    particle.gfx.endFill();
  }

  private drawDefaultParticle ( particle: EnhancedParticle ): void
  {
    particle.gfx.beginFill( particle.color );
    particle.gfx.drawCircle( 0, 0, particle.size );
    particle.gfx.endFill();
  }

  public update (): void
  {
    if ( !this.isEnabled ) return;

    for ( let i = this.particles.length - 1; i >= 0; i-- )
    {
      const particle = this.particles[ i ];

      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Apply gravity
      particle.vy += particle.gravity;

      // Apply air resistance
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Update size (shrink over time for some types)
      if ( particle.type === ParticleType.EXPLOSION || particle.type === ParticleType.FIRE )
      {
        particle.size = particle.initialSize * ( particle.life / particle.maxLife );
      }

      // Update life
      particle.life--;

      // Update trail for electric particles
      if ( particle.type === ParticleType.ELECTRIC )
      {
        particle.trail.push( { x: particle.x, y: particle.y } );
        if ( particle.trail.length > 5 ) particle.trail.shift();
      }

      // Update graphics
      this.updateParticleGraphics( particle );

      // Remove dead particles
      if ( particle.life <= 0 )
      {
        this.particlePool.release( particle );
        this.particles.splice( i, 1 );
      }
    }

    // Limit max particles for performance
    if ( this.particles.length > GAME_CONFIG.MAX_PARTICLES )
    {
      const excess = this.particles.length - GAME_CONFIG.MAX_PARTICLES;
      for ( let i = 0; i < excess; i++ )
      {
        const particle = this.particles.shift();
        if ( particle )
        {
          this.particlePool.release( particle );
        }
      }
    }
  }

  // Specialized effect methods
  public createFoodEaten ( position: Position, color: number ): void
  {
    this.createBurst( {
      position,
      count: 12,
      color,
      type: ParticleType.SPARKLE,
      velocity: 2,
      spread: Math.PI * 2,
    } );
  }

  public createPowerUpCollected ( position: Position ): void
  {
    this.createBurst( {
      position,
      count: 20,
      color: 0x00AAFF,
      type: ParticleType.MAGIC,
      velocity: 3,
      intensity: 1.5,
    } );
  }

  public createComboEffect ( position: Position, comboCount: number ): void
  {
    this.createBurst( {
      position,
      count: comboCount * 3,
      color: 0xFFD700,
      type: ParticleType.CONFETTI,
      velocity: 4,
      intensity: 2,
    } );
  }

  public createLevelUpEffect ( position: Position ): void
  {
    // Multiple bursts for more dramatic effect
    for ( let i = 0; i < 3; i++ )
    {
      setTimeout( () =>
      {
        this.createBurst( {
          position: {
            x: position.x + MathUtils.randomRange( -20, 20 ),
            y: position.y + MathUtils.randomRange( -20, 20 ),
          },
          count: 15,
          color: 0x00FF88,
          type: ParticleType.FIRE,
          velocity: 3,
        } );
      }, i * 100 );
    }
  }

  public createDeathEffect ( position: Position ): void
  {
    // Explosion effect
    this.createBurst( {
      position,
      count: 30,
      color: 0xFF4444,
      type: ParticleType.EXPLOSION,
      velocity: 5,
      intensity: 2,
    } );

    // Smoke effect
    setTimeout( () =>
    {
      this.createBurst( {
        position,
        count: 10,
        color: 0x666666,
        type: ParticleType.SMOKE,
        velocity: 1,
        gravity: -0.05,
      } );
    }, 200 );
  }

  public createAchievementEffect ( position: Position ): void
  {
    this.createBurst( {
      position,
      count: 25,
      color: 0xFFD700,
      type: ParticleType.MAGIC,
      velocity: 2,
      duration: 60,
    } );
  }

  // Legacy methods for backwards compatibility
  public burstAt ( x: number, y: number, color: number = 0xFFFF00, count: number = 18 ): void
  {
    this.createBurst( {
      position: { x, y },
      count,
      color,
      type: ParticleType.EXPLOSION,
    } );
  }
} 