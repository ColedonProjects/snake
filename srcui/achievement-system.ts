import { Container } from 'pixi.js';
// Sound system removed

interface Achievement
{
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  condition: ( stats: GameStats ) => boolean;
}

interface GameStats
{
  score: number;
  level: number;
  survivalTime: number;
  comboCount: number;
  powerUpCount: number;
}

export class AchievementSystem
{
  public container: Container;
  private achievements: Achievement[];
  private gameStats: GameStats;
  private onAchievementUnlocked?: ( achievementName: string ) => void;

  constructor ()
  {
    this.container = new Container();
    this.container.visible = false; // Don't show on canvas

    this.gameStats = {
      score: 0,
      level: 1,
      survivalTime: 0,
      comboCount: 0,
      powerUpCount: 0,
    };

    this.achievements = [
      {
        id: 'first-food',
        name: 'First Food',
        description: 'Eat your first food',
        isUnlocked: false,
        condition: ( stats ) => stats.score >= 10,
      },
      {
        id: 'score-100',
        name: 'Score 100',
        description: 'Reach 100 points',
        isUnlocked: false,
        condition: ( stats ) => stats.score >= 100,
      },
      {
        id: 'score-500',
        name: 'Score 500',
        description: 'Reach 500 points',
        isUnlocked: false,
        condition: ( stats ) => stats.score >= 500,
      },
      {
        id: 'level-5',
        name: 'Level 5',
        description: 'Reach level 5',
        isUnlocked: false,
        condition: ( stats ) => stats.level >= 5,
      },
      {
        id: 'combo-master',
        name: 'Combo Master',
        description: 'Get a 10x combo',
        isUnlocked: false,
        condition: ( stats ) => stats.comboCount >= 10,
      },
      {
        id: 'power-user',
        name: 'Power User',
        description: 'Collect 5 power-ups',
        isUnlocked: false,
        condition: ( stats ) => stats.powerUpCount >= 5,
      },
    ];
  }

  public setOnAchievementUnlocked ( callback: ( achievementName: string ) => void ): void
  {
    this.onAchievementUnlocked = callback;
  }

  public updateScore ( score: number ): void
  {
    this.gameStats.score = score;
    this.checkAchievements();
  }

  public updateLevel ( level: number ): void
  {
    this.gameStats.level = level;
    this.checkAchievements();
  }

  public updateSurvivalTime (): void
  {
    this.gameStats.survivalTime++;
    this.checkAchievements();
  }

  public updateComboCount (): void
  {
    this.gameStats.comboCount++;
    this.checkAchievements();
  }

  public updatePowerUpCount (): void
  {
    this.gameStats.powerUpCount++;
    this.checkAchievements();
  }

  private checkAchievements (): void
  {
    for ( const achievement of this.achievements )
    {
      if ( !achievement.isUnlocked && achievement.condition( this.gameStats ) )
      {
        achievement.isUnlocked = true;
        if ( this.onAchievementUnlocked )
        {
          this.onAchievementUnlocked( achievement.name );
        }
      }
    }
  }

  public getUnlockedAchievements (): string[]
  {
    return this.achievements
      .filter( achievement => achievement.isUnlocked )
      .map( achievement => achievement.name );
  }

  public resetGameSession (): void
  {
    this.gameStats = {
      score: 0,
      level: 1,
      survivalTime: 0,
      comboCount: 0,
      powerUpCount: 0,
    };
    // Don't reset unlocked achievements - they persist across games
  }
} 