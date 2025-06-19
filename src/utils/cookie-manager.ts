interface GameStats
{
  gamesPlayed: number;
  highestScore: number;
  totalScore: number;
  averageScore: number;
  lastPlayed: string;
}

export class CookieManager
{
  private static readonly COOKIE_NAME = 'snake_game_stats';
  private static readonly DEFAULT_STATS: GameStats = {
    gamesPlayed: 0,
    highestScore: 0,
    totalScore: 0,
    averageScore: 0,
    lastPlayed: ''
  };

  /**
   * Set a cookie with no expiration date (persistent)
   */
  private static setCookie ( name: string, value: string ): void
  {
    // Set cookie to expire in 10 years (effectively permanent)
    const expires = new Date();
    expires.setFullYear( expires.getFullYear() + 10 );

    document.cookie = `${ name }=${ encodeURIComponent( value ) }; expires=${ expires.toUTCString() }; path=/; SameSite=Strict`;
  }

  /**
   * Get a cookie value by name
   */
  private static getCookie ( name: string ): string | null
  {
    const nameEQ = name + "=";
    const ca = document.cookie.split( ';' );

    for ( let i = 0; i < ca.length; i++ )
    {
      let c = ca[ i ];
      while ( c.charAt( 0 ) === ' ' ) c = c.substring( 1, c.length );
      if ( c.indexOf( nameEQ ) === 0 )
      {
        return decodeURIComponent( c.substring( nameEQ.length, c.length ) );
      }
    }
    return null;
  }

  /**
   * Load game statistics from cookies
   */
  public static loadStats (): GameStats
  {
    try
    {
      const statsJson = this.getCookie( this.COOKIE_NAME );
      if ( statsJson )
      {
        const stats = JSON.parse( statsJson );
        // Ensure all required properties exist
        return {
          ...this.DEFAULT_STATS,
          ...stats
        };
      }
    } catch ( error )
    {
      console.warn( '[CookieManager] Error loading stats from cookies:', error );
    }

    return { ...this.DEFAULT_STATS };
  }

  /**
   * Save game statistics to cookies
   */
  public static saveStats ( stats: GameStats ): void
  {
    try
    {
      const statsJson = JSON.stringify( stats );
      this.setCookie( this.COOKIE_NAME, statsJson );
      console.log( '[CookieManager] Stats saved:', stats );
    } catch ( error )
    {
      console.error( '[CookieManager] Error saving stats to cookies:', error );
    }
  }

  /**
   * Record a completed game
   */
  public static recordGame ( finalScore: number ): GameStats
  {
    const currentStats = this.loadStats();

    const newStats: GameStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      highestScore: Math.max( currentStats.highestScore, finalScore ),
      totalScore: currentStats.totalScore + finalScore,
      averageScore: 0, // Will be calculated below
      lastPlayed: new Date().toISOString()
    };

    // Calculate average score
    newStats.averageScore = Math.round( newStats.totalScore / newStats.gamesPlayed );

    this.saveStats( newStats );
    return newStats;
  }

  /**
   * Update highest score if current score is higher
   */
  public static updateHighScore ( currentScore: number ): boolean
  {
    const stats = this.loadStats();
    if ( currentScore > stats.highestScore )
    {
      stats.highestScore = currentScore;
      this.saveStats( stats );
      return true; // New high score achieved
    }
    return false;
  }

  /**
   * Get formatted statistics for display
   */
  public static getFormattedStats ():
    {
      gamesPlayed: string;
      highestScore: string;
      averageScore: string;
      lastPlayed: string;
    }
  {
    const stats = this.loadStats();

    return {
      gamesPlayed: stats.gamesPlayed.toLocaleString(),
      highestScore: stats.highestScore.toLocaleString(),
      averageScore: stats.averageScore.toLocaleString(),
      lastPlayed: stats.lastPlayed ?
        new Date( stats.lastPlayed ).toLocaleDateString() :
        'Never'
    };
  }

  /**
   * Reset all statistics (for testing or user preference)
   */
  public static resetStats (): void
  {
    this.saveStats( { ...this.DEFAULT_STATS } );
    console.log( '[CookieManager] All stats reset' );
  }

  /**
   * Check if this is the first time playing
   */
  public static isFirstTime (): boolean
  {
    const stats = this.loadStats();
    return stats.gamesPlayed === 0;
  }
} 