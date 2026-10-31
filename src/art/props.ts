// Objets 8×8 et effets d'événement.

import type { EffectKey, PropKey } from '../game/types';
import type { Grid, Palette } from './pixel';

const P: Palette = {
  k: '#1d1a2f',
  y: '#ffc93c',
  Y: '#d99a00',
  r: '#ff5a4e',
  R: '#b8322a',
  w: '#fffaf0',
  p: '#ff8fab',
  b: '#3a86ff',
  B: '#1f4fa8',
  g: '#7bd65b',
  G: '#3c8c2c',
  n: '#8b5a2b',
  N: '#5c3a1a',
  s: '#a7b1c2',
  S: '#6c7a89',
  o: '#ff7b00',
  t: '#f2d7a6',
  v: '#6c4ab6',
};

export const PROP_SPRITES: Record<PropKey, { rows: Grid; label: string }> = {
  key: { label: 'Clé', rows: ['........', '.yyy....', 'y..y....', 'y..yyyyy', '.yyy.y.y', '.....y.y', '........', '........'] },
  cake: { label: 'Gâteau', rows: ['...r....', '...y....', '..pppp..', '..wwww..', '.pppppp.', '.wwwwww.', 'pppppppp', 'nnnnnnnn'] },
  umbrella: { label: 'Parapluie', rows: ['...rr...', '.rrrrrr.', 'rrRrrRrr', 'r..k...r', '...k....', '...k....', '...k.k..', '....k...'] },
  phone: { label: 'Téléphone', rows: ['.kkkkkk.', '.kbbbbk.', '.kbbbbk.', '.kbbbbk.', '.kbbbbk.', '.kkkkkk.', '.kkwwkk.', '.kkkkkk.'] },
  map: { label: 'Carte', rows: ['tttttttt', 'tNttttNt', 'ttNttNtt', 'tttrrttt', 'tttrrNtt', 'ttNttttt', 'tNtttNtt', 'tttttttt'] },
  duck: { label: 'Canard', rows: ['...yy...', '..ykyo..', '..yyyoo.', 'y.yyy...', 'yyyyyyy.', 'yyyyYyy.', '.yyyyy..', '........'] },
  bouquet: { label: 'Bouquet', rows: ['.r.p.r..', 'rRpPrRr.', '.rp.pr..', '..gGg...', '...g....', '..ggg...', '..vvv...', '...v....'] },
  briefcase: { label: 'Mallette', rows: ['........', '..nnnn..', '..n..n..', 'NNNNNNNN', 'NnnnnnnN', 'NnnyynnN', 'NnnnnnnN', 'NNNNNNNN'] },
  crown: { label: 'Couronne', rows: ['........', 'y..y..y.', 'yy.y.yy.', 'yyyyyyy.', 'yrryrry.', 'yyyyyyy.', 'YYYYYYY.', '........'] },
  sock: { label: 'Chaussette', rows: ['..rrrr..', '..wwww..', '..rrrr..', '..wwww..', '..rrrr..', '..rrrrr.', '.rrrrrrr', '.rrrrrr.'] },
  toaster: { label: 'Grille-pain', rows: ['..t..t..', '..t..t..', 'ssssssss', 'sSSSSSSs', 'ssssssss', 'sssssrss', 'ssssssss', 'k......k'] },
  letter: { label: 'Lettre', rows: ['........', 'wwwwwwww', 'wkwwwwkw', 'wwkwwkww', 'wwwkkwww', 'wwwrrwww', 'wwwwwwww', '........'] },
};

export const PROP_PALETTE = P;

export const EFFECT_SPRITES: Record<EffectKey, { rows: Grid; label: string }> = {
  lightning: { label: 'Éclair', rows: ['...yyy', '..yyy.', '.yyy..', 'yyyyy.', '..yy..', '.yy...', '.y....'] },
  rain: { label: 'Pluie', rows: ['b...b...b.', '.b...b...b', '..........', '..b...b...', 'b..b...b..', '..........', '.b...b...b'] },
  hearts: { label: 'Cœurs', rows: ['.rr.rr........', 'rrrrrrr...p.p.', 'rrrrrrr..ppppp', '.rrrrr....ppp.', '..rrr......p..', '...r..........'] },
  question: { label: 'Mystère', rows: ['.yyyy.', 'yy..yy', '....yy', '...yy.', '..yy..', '......', '..yy..'] },
  boom: { label: 'Explosion', rows: ['....y....', '.y..o..y.', '..yoooy..', '.yoorooy.', 'yoorrroo.', '.yoorooy.', '..yoooy..', '.y..o..y.', '....y....'] },
  stars: { label: 'Étoiles', rows: ['.y.......', 'yyy....y.', '.y....yyy', '........y', '...y.....', '..yyy....', '...y.....'] },
  zzz: { label: 'Sommeil', rows: ['bbbb.....', '..b......', '.b.......', 'bbbb.bbb.', '......b..', '.....bbb.'] },
  notes: { label: 'Musique', rows: ['...kkk', '...k.k', '...k.k', '...k.k', '.kkk.k', 'kkkkkk', '.kk.kk'] },
};
