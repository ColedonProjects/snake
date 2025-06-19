export type SnakeSkin = {
  name: string;
  color: number;
  particle: number;
};

const skins: SnakeSkin[] = [
  {
    name: 'Classic',
    color: 0x00ff00,
    particle: 0xffe066,
  },
  {
    name: 'Neon',
    color: 0x00ffff,
    particle: 0xff00ff,
  },
  {
    name: 'Rainbow',
    color: 0xff0000, // Will cycle in code
    particle: 0xffffff,
  },
  {
    name: 'Retro',
    color: 0xffff00,
    particle: 0x00ffff,
  },
];

let current = 0;
const listeners: ( ( skin: SnakeSkin ) => void )[] = [];

export const SkinManager = {
  getSkin (): SnakeSkin
  {
    return skins[ current ];
  },
  nextSkin ()
  {
    current = ( current + 1 ) % skins.length;
    listeners.forEach( cb => cb( skins[ current ] ) );
  },
  onSkinChange ( cb: ( skin: SnakeSkin ) => void )
  {
    listeners.push( cb );
  },
}; 