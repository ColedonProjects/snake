export interface GameState
{
  score: number;
  level: number;
  speed: number;
  isGameOver: boolean;
}

export interface Position
{
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right'; 