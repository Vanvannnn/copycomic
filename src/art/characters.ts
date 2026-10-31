// Personnages 12×16. Les humains sont assemblés à partir d'une tête et d'un
// corps ; robot, extraterrestre, fantôme et chat sont dessinés à la main.

import type { CharacterKey } from '../game/types';
import type { Grid, Palette } from './pixel';

const INK = '#1d1a2f';
const SKIN = '#f2b48c';
const SKIN_DARK = '#a8674a';
const MOUTH = '#b34a4a';

const HEADS = {
  short: ['....hhhh....', '...hhhhhh...', '...hssssh...', '...sesses...', '...ssssss...', '....smms....'],
  fedora: ['....HHHH....', '..HHHHHHHH..', '...hssssh...', '...sesses...', '...ssssss...', '....smms....'],
  toque: ['...wwwwww...', '...wwwwww...', '...kkkkkk...', '...sesses...', '...ssssss...', '....smms....'],
  bun: ['.....hh.....', '...hhhhhh...', '...hssssh...', '...gegseg...', '...ssssss...', '....smms....'],
  helmet: ['....rr......', '...MMMMMM...', '...MMMMMM...', '...MkkkkM...', '...MMMMMM...', '....MMMM....'],
  veil: ['..vvhhhhvv..', '..vhhhhhhv..', '..vhsssshv..', '..vsessesv..', '..vssssssv..', '..v.smms.v..'],
  bandana: ['...rrrrrr...', '...rrrrrrrr.', '...hssssh...', '...skssess..', '...ssssss...', '....smms....'],
  wild: ['..h.hhhh.h..', '..hhhhhhhh..', '...hssssh...', '...GeGGeG...', '...ssssss...', '....smms....'],
  cap: ['............', '...cccccc...', '...ccccccc..', '...sesses...', '...ssssss...', '....smms....'],
  wig: ['...wwwwww...', '..wwwwwwww..', '..wssssssw..', '..wsessesw..', '..wssssssw..', '..w.smms.w..'],
  hood: ['...kkkkkk...', '..kkkkkkkk..', '..kkddddkk..', '..kkwddwkk..', '..kkddddkk..', '...kkkkkk...'],
} as const;

const BODIES = {
  pants: [
    '....oaao....',
    '..oooooooo..',
    '..oooooooo..',
    '..soooooos..',
    '....oooo....',
    '....pppp....',
    '....p..p....',
    '....p..p....',
    '...bb..bb...',
    '............',
  ],
  dress: [
    '....oaao....',
    '..oooooooo..',
    '..oooooooo..',
    '..soooooos..',
    '...oooooo...',
    '...oooooo...',
    '..oooooooo..',
    '..oooooooo..',
    '...bb..bb...',
    '............',
  ],
  armor: [
    '....MaaM....',
    '..MMMMMMMM..',
    '.kMMMMMMMMk.',
    '.kMMMMMMMMk.',
    '....MMMM....',
    '....pppp....',
    '....p..p....',
    '....p..p....',
    '...bb..bb...',
    '............',
  ],
} as const;

interface HumanSpec {
  head: keyof typeof HEADS;
  body: keyof typeof BODIES;
  hair: string;
  outfit: string;
  accent: string;
  pants?: string;
  boots?: string;
  hat?: string;
  skin?: string;
}

function human(spec: HumanSpec): { rows: Grid; palette: Palette } {
  return {
    rows: [...HEADS[spec.head], ...BODIES[spec.body]],
    palette: {
      h: spec.hair,
      s: spec.skin ?? SKIN,
      e: INK,
      m: MOUTH,
      o: spec.outfit,
      a: spec.accent,
      p: spec.pants ?? '#3b3f6b',
      b: spec.boots ?? INK,
      H: spec.hat ?? '#6b4b2e',
      w: '#fffaf0',
      k: INK,
      g: '#7fd1ff',
      G: '#3fb7a8',
      r: '#e63946',
      M: '#a7b1c2',
      v: '#f7f3ff',
      c: '#ff7b00',
      d: '#3a3350',
    },
  };
}

const ROBOT: Grid = [
  '.....aa.....',
  '.....kk.....',
  '..MMMMMMMM..',
  '..MwwMMwwM..',
  '..MwkMMwkM..',
  '..MMMMMMMM..',
  '..MMrrrrMM..',
  '...MMMMMM...',
  '.kMMMMMMMMk.',
  '.kMMMggMMMk.',
  '.kMMMggMMMk.',
  '..MMMMMMMM..',
  '...kk..kk...',
  '...kk..kk...',
  '..MMM..MMM..',
  '............',
];

const ALIEN: Grid = [
  '..y......y..',
  '...g....g...',
  '...gggggg...',
  '..gggggggg..',
  '.gkkggggkkg.',
  '.gkwggggkwg.',
  '..gggggggg..',
  '...gggkgg...',
  '....gggg....',
  '..pppppppp..',
  '.gpppyyppg..',
  '.g.pppppp.g.',
  '...pppppp...',
  '....g..g....',
  '...gg..gg...',
  '............',
];

const GHOST: Grid = [
  '............',
  '....wwww....',
  '...wwwwww...',
  '..wwwwwwww..',
  '..wwkwwkww..',
  '..wwkwwkww..',
  '..wwwwwwww..',
  '..wwwkkwww..',
  '..wwwwwwww..',
  '.wwwwwwwwww.',
  '.wwwwwwwwww.',
  '.wwwwwwwwww.',
  '.wwwwwwwwww.',
  '.ww.www.ww..',
  '.w...w...w..',
  '............',
];

const CAT: Grid = [
  '............',
  '............',
  '............',
  '............',
  '............',
  '..k......k..',
  '..kk....kk..',
  '..kkkkkkkk..',
  '..kykkkkyk..',
  '..kkkpkkkk..',
  '...kkkkkk...',
  '...kkkkkk..k',
  '..kkkkkkkk.k',
  '..kkkkkkkkk.',
  '..kk.kk.kk..',
  '............',
];

const CUSTOM_PALETTE: Palette = {
  a: '#ff5a4e',
  k: INK,
  M: '#9fb3c8',
  w: '#fffaf0',
  r: '#ff5a4e',
  g: '#7bd65b',
  y: '#ffc93c',
  p: '#6c4ab6',
  v: '#cfe8ff',
};

const GHOST_PALETTE: Palette = { w: '#eef4ff', k: INK };
const CAT_PALETTE: Palette = { k: '#2f2a45', y: '#ffd23f', p: '#ff8fab' };

export const CHARACTER_SPRITES: Record<CharacterKey, { rows: Grid; palette: Palette; label: string }> = {
  detective: { ...human({ head: 'fedora', body: 'pants', hair: '#5b3a29', outfit: '#d9a85b', accent: '#7a4f2a', hat: '#6b4b2e' }), label: 'Détective' },
  grandma: { ...human({ head: 'bun', body: 'dress', hair: '#c9c9d6', outfit: '#8e5bd1', accent: '#f6e7ff' }), label: 'Mamie' },
  chef: { ...human({ head: 'toque', body: 'pants', hair: INK, outfit: '#fffaf0', accent: '#ff5a4e', pants: '#2b2d42' }), label: 'Chef' },
  knight: { ...human({ head: 'helmet', body: 'armor', hair: INK, outfit: '#a7b1c2', accent: '#ffc93c', pants: '#6c7a89' }), label: 'Chevalier' },
  bride: { ...human({ head: 'veil', body: 'dress', hair: '#7a4b2a', outfit: '#fffaf0', accent: '#ff8fab', boots: '#d8d8e0' }), label: 'Mariée' },
  pirate: { ...human({ head: 'bandana', body: 'pants', hair: '#2b1d14', outfit: '#3a86ff', accent: '#fffaf0', skin: SKIN_DARK }), label: 'Pirate' },
  scientist: { ...human({ head: 'wild', body: 'pants', hair: '#f1f1f1', outfit: '#e9f5f2', accent: '#3fb7a8', pants: '#4a4e69' }), label: 'Savant' },
  kid: { ...human({ head: 'cap', body: 'pants', hair: INK, outfit: '#ffc93c', accent: '#ff7b00', pants: '#3a86ff', skin: SKIN_DARK }), label: 'Enfant' },
  witness: { ...human({ head: 'short', body: 'pants', hair: '#d4a017', outfit: '#2ec4b6', accent: '#1b7f74' }), label: 'Témoin' },
  judge: { ...human({ head: 'wig', body: 'dress', hair: '#fffaf0', outfit: '#232136', accent: '#fffaf0' }), label: 'Juge' },
  masked: { ...human({ head: 'hood', body: 'pants', hair: INK, outfit: '#3a3350', accent: '#6c4ab6' }), label: 'Inconnu masqué' },
  robot: { rows: ROBOT, palette: CUSTOM_PALETTE, label: 'Robot' },
  alien: { rows: ALIEN, palette: CUSTOM_PALETTE, label: 'Extraterrestre' },
  ghost: { rows: GHOST, palette: GHOST_PALETTE, label: 'Fantôme' },
  cat: { rows: CAT, palette: CAT_PALETTE, label: 'Chat' },
};
