export type Theme = {
  name: string;
  background: number;
  snake: number;
  food: number;
  powerUp: number;
  particle: number;
  uiText: string;
  combo: string;
};

const themes: Theme[] = [
  {
    name: 'Dark',
    background: 0x1a1a1a,
    snake: 0x00ff00,
    food: 0xff4444,
    powerUp: 0x3399ff,
    particle: 0xffe066,
    uiText: '#fff',
    combo: '#ffe066',
  },
  {
    name: 'Light',
    background: 0xf8f8f8,
    snake: 0x228833,
    food: 0xdd2222,
    powerUp: 0x2277cc,
    particle: 0xffc300,
    uiText: '#222',
    combo: '#ffb700',
  },
  {
    name: 'Retro',
    background: 0x222244,
    snake: 0x00ffff,
    food: 0xff00ff,
    powerUp: 0xffff00,
    particle: 0x00ffff,
    uiText: '#00ffff',
    combo: '#ff00ff',
  },
];

let current = 2; // Default to Retro theme
const listeners: ( ( theme: Theme ) => void )[] = [];

export const ThemeManager = {
  getTheme (): Theme
  {
    return themes[ current ];
  },
  nextTheme ()
  {
    current = ( current + 1 ) % themes.length;
    listeners.forEach( cb => cb( themes[ current ] ) );
  },
  onThemeChange ( cb: ( theme: Theme ) => void )
  {
    listeners.push( cb );
  },
}; 