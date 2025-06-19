import { Howl, Howler } from 'howler';

export enum SoundEffect
{
  MOVE = 'move',
  EAT = 'eat',
  POWER_UP = 'powerup',
  GAME_OVER = 'gameover',
  LEVEL_UP = 'levelup',
  COMBO = 'combo',
  ACHIEVEMENT = 'achievement',
  BUTTON_CLICK = 'click'
}

export class SoundManager
{
  private static instance: SoundManager;
  private sounds: Map<SoundEffect, Howl> = new Map();
  private backgroundMusic: Howl | null = null;
  private volume: number = 0.7;
  private musicVolume: number = 0.3;
  private enabled: boolean = true;
  private musicEnabled: boolean = true;
  private audioInitialized: boolean = false;
  private pendingSounds: SoundEffect[] = [];
  private audioContext: AudioContext | null = null;
  private isUserInteracted: boolean = false;

  private constructor ()
  {
    console.log( '[SoundManager] Constructor called' );
    this.setupUserInteractionHandler();
    this.setupHowlerConfig();
  }

  public static getInstance (): SoundManager
  {
    if ( !SoundManager.instance )
    {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private setupHowlerConfig ()
  {
    // Configure Howler.js for better browser compatibility
    Howler.autoUnlock = true;
    Howler.autoSuspend = false;
    Howler.html5PoolSize = 10;

    // Log Howler state for debugging
    console.log( '[SoundManager] Howler state:', {
      ctx: Howler.ctx?.state,
      autoUnlock: Howler.autoUnlock
    } );
  }

  private setupUserInteractionHandler ()
  {
    console.log( '[SoundManager] Setting up user interaction handler' );

    const initAudio = async ( event: Event ) =>
    {
      console.log( '[SoundManager] User interaction detected:', event.type );

      if ( this.isUserInteracted ) return;
      this.isUserInteracted = true;

      try
      {
        // Initialize AudioContext first
        await this.initializeAudioContext();

        // Then initialize sounds
        await this.initializeSounds();

        this.audioInitialized = true;
        console.log( '[SoundManager] Audio initialized successfully' );

        // Play any pending sounds
        this.pendingSounds.forEach( sound =>
        {
          console.log( '[SoundManager] Playing pending sound:', sound );
          this.play( sound );
        } );
        this.pendingSounds = [];

        // Start background music if enabled
        if ( this.musicEnabled && this.backgroundMusic )
        {
          this.playMusic();
        }

      } catch ( error )
      {
        console.error( '[SoundManager] Error initializing audio:', error );
      }
    };

    // Add multiple event listeners with better options
    const eventOptions = { passive: true, once: false };

    document.addEventListener( 'click', initAudio, eventOptions );
    document.addEventListener( 'keydown', initAudio, eventOptions );
    document.addEventListener( 'touchstart', initAudio, eventOptions );
    document.addEventListener( 'pointerdown', initAudio, eventOptions );

    // Also listen for game start
    window.addEventListener( 'gamestart', initAudio, eventOptions );
  }

  private async initializeAudioContext (): Promise<void>
  {
    try
    {
      // Create shared AudioContext
      this.audioContext = new ( window.AudioContext || ( window as any ).webkitAudioContext )();

      console.log( '[SoundManager] AudioContext created, state:', this.audioContext.state );

      // Resume AudioContext if suspended
      if ( this.audioContext.state === 'suspended' )
      {
        console.log( '[SoundManager] Resuming suspended AudioContext' );
        await this.audioContext.resume();
      }

      console.log( '[SoundManager] AudioContext ready, state:', this.audioContext.state );

      // Configure Howler to use our context
      if ( Howler.ctx && Howler.ctx.state === 'suspended' )
      {
        await Howler.ctx.resume();
      }

    } catch ( error )
    {
      console.error( '[SoundManager] Error creating AudioContext:', error );
      throw error;
    }
  }

  private async initializeSounds ()
  {
    console.log( '[SoundManager] Initializing sounds...' );

    if ( !this.audioContext )
    {
      throw new Error( 'AudioContext not initialized' );
    }

    try
    {
      // Generate synthetic sounds using our shared AudioContext
      await this.createSyntheticSounds();
      console.log( '[SoundManager] Synthetic sounds created successfully' );
    } catch ( error )
    {
      console.error( '[SoundManager] Error creating synthetic sounds, trying fallback:', error );
      // Try simple fallback sounds
      this.createFallbackSounds();
    }
  }

  private async createSyntheticSounds ()
  {
    if ( !this.audioContext ) throw new Error( 'AudioContext not available' );

    console.log( '[SoundManager] Creating synthetic sounds with AudioContext' );

    // Move sound - subtle tick
    this.sounds.set( SoundEffect.MOVE, await this.createToneSound( 200, 0.05, 0.1 ) );

    // Eat sound - pleasant chirp
    this.sounds.set( SoundEffect.EAT, await this.createToneSound( 440, 0.2, 0.3 ) );

    // Power-up sound - ascending notes
    this.sounds.set( SoundEffect.POWER_UP, await this.createChordSound( [ 440, 550, 660 ], 0.5, 0.4 ) );

    // Game over sound - descending tone
    this.sounds.set( SoundEffect.GAME_OVER, await this.createSweepSound( 440, 220, 1.0, 0.6 ) );

    // Level up sound - victory fanfare
    this.sounds.set( SoundEffect.LEVEL_UP, await this.createChordSound( [ 523, 659, 784 ], 0.8, 0.5 ) );

    // Combo sound - quick ascending notes
    this.sounds.set( SoundEffect.COMBO, await this.createArpeggioSound( [ 440, 523, 659 ], 0.4, 0.4 ) );

    // Achievement sound - triumphant chord
    this.sounds.set( SoundEffect.ACHIEVEMENT, await this.createChordSound( [ 523, 659, 784, 988 ], 1.2, 0.6 ) );

    // Button click - soft click
    this.sounds.set( SoundEffect.BUTTON_CLICK, await this.createToneSound( 800, 0.1, 0.2 ) );

    // Background music - simple melody loop
    await this.createBackgroundMusic();
  }

  private createFallbackSounds ()
  {
    console.log( '[SoundManager] Creating fallback sounds using data URLs' );

    // Simple beep data URLs as fallback
    const simpleBeep = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTV+0fPTgjEGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnkpBSl+0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTV+0fPTgjEGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnkpBSl+0fPNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTV+0fPTgjEGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnkpBSl+0fPNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTV+0fPTgjEGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnkpBSl+0fPNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTV+0fPTgjEGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnkpBSl+0fPNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTV+0fPTgjEGHm7A7+OZRQ0PVqzn77BdGAg=';

    Object.values( SoundEffect ).forEach( effect =>
    {
      this.sounds.set( effect, new Howl( {
        src: [ simpleBeep ],
        volume: this.volume * 0.3 // Quieter fallback
      } ) );
    } );

    // Simple background music
    this.backgroundMusic = new Howl( {
      src: [ simpleBeep ],
      loop: true,
      volume: this.musicVolume * 0.1
    } );
  }

  private async createToneSound ( frequency: number, duration: number, volume: number ): Promise<Howl>
  {
    if ( !this.audioContext ) throw new Error( 'AudioContext not available' );

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer( 1, sampleRate * duration, sampleRate );
    const data = buffer.getChannelData( 0 );

    for ( let i = 0; i < buffer.length; i++ )
    {
      const t = i / sampleRate;
      const envelope = Math.exp( -t * 3 ) * Math.sin( 2 * Math.PI * frequency * t );
      data[ i ] = envelope * volume;
    }

    return new Howl( {
      src: [ this.bufferToDataURL( buffer ) ],
      volume: this.volume
    } );
  }

  private async createChordSound ( frequencies: number[], duration: number, volume: number ): Promise<Howl>
  {
    if ( !this.audioContext ) throw new Error( 'AudioContext not available' );

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer( 1, sampleRate * duration, sampleRate );
    const data = buffer.getChannelData( 0 );

    for ( let i = 0; i < buffer.length; i++ )
    {
      const t = i / sampleRate;
      let sample = 0;

      frequencies.forEach( freq =>
      {
        const envelope = Math.exp( -t * 2 ) * Math.sin( 2 * Math.PI * freq * t );
        sample += envelope;
      } );

      data[ i ] = ( sample / frequencies.length ) * volume;
    }

    return new Howl( {
      src: [ this.bufferToDataURL( buffer ) ],
      volume: this.volume
    } );
  }

  private async createSweepSound ( startFreq: number, endFreq: number, duration: number, volume: number ): Promise<Howl>
  {
    if ( !this.audioContext ) throw new Error( 'AudioContext not available' );

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer( 1, sampleRate * duration, sampleRate );
    const data = buffer.getChannelData( 0 );

    for ( let i = 0; i < buffer.length; i++ )
    {
      const t = i / sampleRate;
      const progress = t / duration;
      const frequency = startFreq + ( endFreq - startFreq ) * progress;
      const envelope = Math.exp( -t * 1.5 ) * Math.sin( 2 * Math.PI * frequency * t );
      data[ i ] = envelope * volume;
    }

    return new Howl( {
      src: [ this.bufferToDataURL( buffer ) ],
      volume: this.volume
    } );
  }

  private async createArpeggioSound ( frequencies: number[], duration: number, volume: number ): Promise<Howl>
  {
    if ( !this.audioContext ) throw new Error( 'AudioContext not available' );

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer( 1, sampleRate * duration, sampleRate );
    const data = buffer.getChannelData( 0 );
    const noteLength = duration / frequencies.length;

    for ( let i = 0; i < buffer.length; i++ )
    {
      const t = i / sampleRate;
      const noteIndex = Math.floor( t / noteLength ) % frequencies.length;
      const noteTime = t - ( Math.floor( t / noteLength ) * noteLength );

      if ( noteIndex < frequencies.length )
      {
        const frequency = frequencies[ noteIndex ];
        const envelope = Math.exp( -noteTime * 8 ) * Math.sin( 2 * Math.PI * frequency * noteTime );
        data[ i ] = envelope * volume;
      }
    }

    return new Howl( {
      src: [ this.bufferToDataURL( buffer ) ],
      volume: this.volume
    } );
  }

  private async createBackgroundMusic ()
  {
    if ( !this.audioContext ) throw new Error( 'AudioContext not available' );

    // Simple repeating melody
    const melody = [ 523, 587, 659, 698, 784, 698, 659, 587 ]; // C-D-E-F-G-F-E-D
    const sampleRate = this.audioContext.sampleRate;
    const duration = 8.0; // 8 seconds loop
    const buffer = this.audioContext.createBuffer( 1, sampleRate * duration, sampleRate );
    const data = buffer.getChannelData( 0 );
    const noteLength = duration / melody.length;

    for ( let i = 0; i < buffer.length; i++ )
    {
      const t = i / sampleRate;
      const noteIndex = Math.floor( t / noteLength ) % melody.length;
      const noteTime = t - ( Math.floor( t / noteLength ) * noteLength );

      const frequency = melody[ noteIndex ];
      const envelope = Math.exp( -noteTime * 1 ) * Math.sin( 2 * Math.PI * frequency * noteTime );
      data[ i ] = envelope * 0.1; // Very quiet background music
    }

    this.backgroundMusic = new Howl( {
      src: [ this.bufferToDataURL( buffer ) ],
      loop: true,
      volume: this.musicVolume
    } );
  }

  private bufferToDataURL ( buffer: AudioBuffer ): string
  {
    const length = buffer.length;
    const data = new Float32Array( length );
    buffer.copyFromChannel( data, 0 );

    // Convert to 16-bit PCM
    const pcm = new Int16Array( length );
    for ( let i = 0; i < length; i++ )
    {
      pcm[ i ] = Math.max( -32768, Math.min( 32767, data[ i ] * 32768 ) );
    }

    // Create WAV header
    const arrayBuffer = new ArrayBuffer( 44 + pcm.length * 2 );
    const view = new DataView( arrayBuffer );

    // WAV header
    const writeString = ( offset: number, string: string ) =>
    {
      for ( let i = 0; i < string.length; i++ )
      {
        view.setUint8( offset + i, string.charCodeAt( i ) );
      }
    };

    writeString( 0, 'RIFF' );
    view.setUint32( 4, 36 + pcm.length * 2, true );
    writeString( 8, 'WAVE' );
    writeString( 12, 'fmt ' );
    view.setUint32( 16, 16, true );
    view.setUint16( 20, 1, true );
    view.setUint16( 22, 1, true );
    view.setUint32( 24, buffer.sampleRate, true );
    view.setUint32( 28, buffer.sampleRate * 2, true );
    view.setUint16( 32, 2, true );
    view.setUint16( 34, 16, true );
    writeString( 36, 'data' );
    view.setUint32( 40, pcm.length * 2, true );

    // PCM data
    for ( let i = 0; i < pcm.length; i++ )
    {
      view.setInt16( 44 + i * 2, pcm[ i ], true );
    }

    const blob = new Blob( [ arrayBuffer ], { type: 'audio/wav' } );
    return URL.createObjectURL( blob );
  }

  public play ( effect: SoundEffect ): void
  {
    if ( !this.enabled )
    {
      console.log( '[SoundManager] Audio disabled, skipping sound:', effect );
      return;
    }

    if ( !this.audioInitialized )
    {
      console.log( '[SoundManager] Audio not initialized yet, queuing sound:', effect );
      if ( !this.pendingSounds.includes( effect ) )
      {
        this.pendingSounds.push( effect );
      }
      return;
    }

    const sound = this.sounds.get( effect );
    if ( sound )
    {
      console.log( '[SoundManager] Playing sound:', effect );
      try
      {
        sound.volume( this.volume );
        sound.play();
      } catch ( error )
      {
        console.error( '[SoundManager] Error playing sound:', effect, error );
      }
    } else
    {
      console.warn( '[SoundManager] Sound not found:', effect );
    }
  }

  public playMusic (): void
  {
    if ( !this.musicEnabled )
    {
      console.log( '[SoundManager] Music disabled' );
      return;
    }

    if ( !this.audioInitialized )
    {
      console.log( '[SoundManager] Audio not initialized yet, music will play after user interaction' );
      return;
    }

    if ( !this.backgroundMusic )
    {
      console.warn( '[SoundManager] Background music not available' );
      return;
    }

    console.log( '[SoundManager] Playing background music' );
    try
    {
      this.backgroundMusic.volume( this.musicVolume );
      this.backgroundMusic.play();
    } catch ( error )
    {
      console.error( '[SoundManager] Error playing music:', error );
    }
  }

  public stopMusic (): void
  {
    if ( this.backgroundMusic )
    {
      console.log( '[SoundManager] Stopping background music' );
      this.backgroundMusic.stop();
    }
  }

  public setVolume ( volume: number ): void
  {
    this.volume = Math.max( 0, Math.min( 1, volume ) );
    console.log( '[SoundManager] Setting volume to:', this.volume );
    this.sounds.forEach( sound => sound.volume( this.volume ) );
  }

  public setMusicVolume ( volume: number ): void
  {
    this.musicVolume = Math.max( 0, Math.min( 1, volume ) );
    console.log( '[SoundManager] Setting music volume to:', this.musicVolume );
    if ( this.backgroundMusic )
    {
      this.backgroundMusic.volume( this.musicVolume );
    }
  }

  public setEnabled ( enabled: boolean ): void
  {
    this.enabled = enabled;
    console.log( '[SoundManager] Sound enabled:', enabled );
    if ( !enabled )
    {
      this.sounds.forEach( sound => sound.stop() );
    }
  }

  public setMusicEnabled ( enabled: boolean ): void
  {
    this.musicEnabled = enabled;
    console.log( '[SoundManager] Music enabled:', enabled );
    if ( !enabled )
    {
      this.stopMusic();
    } else if ( this.audioInitialized )
    {
      this.playMusic();
    }
  }

  public getVolume (): number
  {
    return this.volume;
  }

  public getMusicVolume (): number
  {
    return this.musicVolume;
  }

  public isEnabled (): boolean
  {
    return this.enabled;
  }

  public isMusicEnabled (): boolean
  {
    return this.musicEnabled;
  }

  public getState (): object
  {
    return {
      audioInitialized: this.audioInitialized,
      isUserInteracted: this.isUserInteracted,
      enabled: this.enabled,
      musicEnabled: this.musicEnabled,
      volume: this.volume,
      musicVolume: this.musicVolume,
      pendingSounds: this.pendingSounds.length,
      audioContextState: this.audioContext?.state,
      howlerCtxState: Howler.ctx?.state
    };
  }
} 