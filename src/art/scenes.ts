// Décors 64×40 décrits par des rectangles [x, y, largeur, hauteur, couleur].

import type { SceneKey } from '../game/types';

export type Rect = readonly [number, number, number, number, string];

export const SCENE_W = 64;
export const SCENE_H = 40;
/** Ligne du sol : les personnages ont les pieds à cette hauteur. */
export const FLOOR_Y = 37;

function checker(y: number, h: number, size: number, a: string, b: string): Rect[] {
  const out: Rect[] = [[0, y, SCENE_W, h, a]];
  for (let row = 0; row * size < h; row++) {
    for (let col = 0; col * size < SCENE_W; col++) {
      if ((row + col) % 2 === 1) out.push([col * size, y + row * size, size, Math.min(size, h - row * size), b]);
    }
  }
  return out;
}

function stripes(y: number, h: number, every: number, base: string, line: string, vertical = false): Rect[] {
  const out: Rect[] = [[0, y, SCENE_W, h, base]];
  if (vertical) for (let x = 0; x < SCENE_W; x += every) out.push([x, y, 1, h, line]);
  else for (let yy = y; yy < y + h; yy += every) out.push([0, yy, SCENE_W, 1, line]);
  return out;
}

function bricks(y: number, h: number, base: string, mortar: string): Rect[] {
  const out: Rect[] = [[0, y, SCENE_W, h, base]];
  for (let row = 0; row * 4 < h; row++) {
    out.push([0, y + row * 4, SCENE_W, 1, mortar]);
    for (let x = row % 2 === 0 ? 0 : 4; x < SCENE_W; x += 8) out.push([x, y + row * 4, 1, 4, mortar]);
  }
  return out;
}

function tree(x: number, y: number, leaf: string, dark: string, trunk: string): Rect[] {
  return [
    [x + 3, y + 14, 2, 6, trunk],
    [x + 2, y, 4, 4, leaf],
    [x + 1, y + 4, 6, 4, dark],
    [x, y + 8, 8, 6, leaf],
    [x + 1, y + 12, 6, 2, dark],
  ];
}

function stars(points: [number, number][], color: string): Rect[] {
  return points.map(([x, y]) => [x, y, 1, 1, color] as Rect);
}

const SCENES: Record<SceneKey, { label: string; rects: Rect[] }> = {
  ballroom: {
    label: 'Salle de bal',
    rects: [
      [0, 0, 64, 40, '#7a2e3b'],
      ...stripes(0, 28, 6, '#7a2e3b', '#8c3a48', true),
      [0, 24, 64, 1, '#d9a441'],
      [6, 4, 10, 18, '#f3d27a'],
      [7, 5, 8, 16, '#2b2550'],
      [48, 4, 10, 18, '#f3d27a'],
      [49, 5, 8, 16, '#2b2550'],
      ...stars([[9, 8], [12, 12], [51, 9], [54, 14]], '#fffaf0'),
      [31, 0, 2, 4, '#d9a441'],
      [25, 4, 14, 2, '#ffc93c'],
      [26, 6, 2, 2, '#fff1a8'],
      [31, 6, 2, 2, '#fff1a8'],
      [36, 6, 2, 2, '#fff1a8'],
      ...checker(28, 12, 4, '#f6ead2', '#2b2550'),
    ],
  },
  spaceship: {
    label: 'Vaisseau spatial',
    rects: [
      [0, 0, 64, 40, '#1b1f3b'],
      [0, 0, 64, 3, '#3d4470'],
      [10, 5, 44, 18, '#5a6390'],
      [12, 7, 40, 14, '#0b0d22'],
      ...stars([[15, 9], [22, 15], [30, 10], [37, 18], [44, 8], [48, 14], [26, 19], [41, 12]], '#ffffff'),
      [33, 12, 5, 5, '#ff7b00'],
      [34, 11, 3, 1, '#ff7b00'],
      [34, 17, 3, 1, '#ff7b00'],
      [3, 8, 4, 2, '#2ec4b6'],
      [3, 12, 4, 2, '#ff5a4e'],
      [57, 8, 4, 2, '#ffc93c'],
      [57, 12, 4, 2, '#2ec4b6'],
      ...stripes(28, 12, 3, '#4a527d', '#363d63', true),
      [0, 28, 64, 1, '#8b93c0'],
    ],
  },
  forest: {
    label: 'Forêt',
    rects: [
      [0, 0, 64, 40, '#a9d8c6'],
      [0, 14, 64, 14, '#7fbfa6'],
      ...tree(2, 6, '#2f7d4f', '#215c3a', '#5c3a1a'),
      ...tree(16, 9, '#3c9a5f', '#2f7d4f', '#6b4b2e'),
      ...tree(40, 5, '#2f7d4f', '#215c3a', '#5c3a1a'),
      ...tree(54, 8, '#3c9a5f', '#2f7d4f', '#6b4b2e'),
      [0, 28, 64, 12, '#4f9a3c'],
      [0, 28, 64, 1, '#7bd65b'],
      ...stars([[6, 33], [19, 35], [33, 31], [47, 36], [58, 32]], '#7bd65b'),
      [28, 3, 8, 2, '#eef4ff'],
      [30, 2, 4, 1, '#eef4ff'],
    ],
  },
  courtroom: {
    label: 'Tribunal',
    rects: [
      [0, 0, 64, 40, '#8b5a2b'],
      ...stripes(0, 28, 8, '#8b5a2b', '#7a4d23', true),
      [18, 10, 28, 10, '#5c3a1a'],
      [18, 10, 28, 2, '#a8743d'],
      [30, 2, 4, 6, '#ffc93c'],
      [26, 4, 12, 1, '#ffc93c'],
      [25, 5, 3, 2, '#ffc93c'],
      [36, 5, 3, 2, '#ffc93c'],
      [4, 4, 8, 12, '#2b2550'],
      [52, 4, 8, 12, '#2b2550'],
      ...stripes(28, 12, 3, '#c08a4f', '#a8743d'),
    ],
  },
  beach: {
    label: 'Plage',
    rects: [
      [0, 0, 64, 40, '#bfe6ff'],
      [50, 3, 7, 7, '#ffc93c'],
      [49, 5, 9, 3, '#ffc93c'],
      [0, 18, 64, 8, '#3a86ff'],
      [0, 18, 64, 1, '#8fc1ff'],
      ...stars([[8, 21], [20, 23], [36, 20], [48, 22]], '#cfe8ff'),
      [0, 26, 64, 14, '#f2d7a6'],
      ...stars([[5, 32], [14, 37], [27, 30], [41, 35], [55, 31]], '#d9b47a'),
      [10, 12, 14, 2, '#ff5a4e'],
      [12, 10, 10, 2, '#fffaf0'],
      [16, 14, 1, 14, '#5c3a1a'],
    ],
  },
  lab: {
    label: 'Laboratoire',
    rects: [
      [0, 0, 64, 40, '#d6f2ea'],
      [0, 10, 64, 1, '#9fd3c7'],
      [4, 9, 24, 2, '#6c7a89'],
      [6, 5, 2, 4, '#7bd65b'],
      [11, 4, 3, 5, '#ff5a4e'],
      [17, 6, 2, 3, '#6c4ab6'],
      [22, 5, 3, 4, '#ffc93c'],
      [40, 4, 18, 14, '#4a4e69'],
      [42, 6, 14, 6, '#2ec4b6'],
      ...stars([[44, 8], [47, 9], [50, 7], [53, 10]], '#d6fff7'),
      [44, 14, 3, 2, '#ff5a4e'],
      [49, 14, 3, 2, '#ffc93c'],
      ...checker(28, 12, 4, '#eef4ff', '#c9d6e3'),
    ],
  },
  castle: {
    label: 'Château',
    rects: [
      ...bricks(0, 28, '#6c7a89', '#55606e'),
      [26, 4, 12, 18, '#2b2550'],
      [28, 2, 8, 2, '#2b2550'],
      ...stars([[29, 8], [34, 12], [31, 16]], '#cfe8ff'),
      [8, 10, 2, 6, '#5c3a1a'],
      [7, 7, 4, 3, '#ff7b00'],
      [8, 6, 2, 1, '#ffc93c'],
      [54, 10, 2, 6, '#5c3a1a'],
      [53, 7, 4, 3, '#ff7b00'],
      [54, 6, 2, 1, '#ffc93c'],
      ...checker(28, 12, 6, '#8a94a3', '#7b8594'),
    ],
  },
  street: {
    label: 'Rue',
    rects: [
      [0, 0, 64, 40, '#2b2550'],
      ...stars([[5, 2], [17, 4], [33, 1], [59, 5]], '#fffaf0'),
      [0, 8, 14, 22, '#3d3570'],
      [16, 4, 16, 26, '#463d80'],
      [36, 10, 12, 20, '#3d3570'],
      [50, 6, 14, 24, '#463d80'],
      [3, 12, 3, 3, '#ffc93c'],
      [8, 18, 3, 3, '#ffc93c'],
      [20, 8, 3, 3, '#ffc93c'],
      [26, 14, 3, 3, '#ffc93c'],
      [39, 14, 3, 3, '#ffc93c'],
      [54, 10, 3, 3, '#ffc93c'],
      [58, 18, 3, 3, '#ffc93c'],
      [33, 12, 1, 18, '#1d1a2f'],
      [31, 11, 5, 2, '#fff1a8'],
      [0, 30, 64, 10, '#55606e'],
      [0, 30, 64, 1, '#a7b1c2'],
      [0, 36, 64, 1, '#6c7a89'],
    ],
  },
  kitchen: {
    label: 'Cuisine',
    rects: [
      ...checker(0, 28, 4, '#fffaf0', '#cfe8ff'),
      [4, 16, 24, 12, '#a7b1c2'],
      [4, 16, 24, 2, '#6c7a89'],
      [7, 20, 6, 6, '#1d1a2f'],
      [17, 20, 6, 6, '#1d1a2f'],
      [8, 12, 6, 4, '#3a3350'],
      [18, 13, 5, 3, '#ff5a4e'],
      [42, 4, 16, 2, '#8b5a2b'],
      [44, 6, 2, 4, '#6c7a89'],
      [49, 6, 3, 5, '#ffc93c'],
      [54, 6, 2, 3, '#ff5a4e'],
      ...checker(28, 12, 4, '#ff5a4e', '#fffaf0'),
    ],
  },
  train: {
    label: 'Train de nuit',
    rects: [
      [0, 0, 64, 40, '#7a2e3b'],
      [0, 0, 64, 3, '#5c1f2a'],
      [4, 6, 16, 12, '#d9a441'],
      [5, 7, 14, 10, '#1b1f3b'],
      [24, 6, 16, 12, '#d9a441'],
      [25, 7, 14, 10, '#1b1f3b'],
      [44, 6, 16, 12, '#d9a441'],
      [45, 7, 14, 10, '#1b1f3b'],
      [5, 14, 14, 3, '#2b4a3b'],
      [25, 13, 14, 4, '#2b4a3b'],
      [45, 15, 14, 2, '#2b4a3b'],
      ...stars([[8, 9], [30, 8], [52, 10], [14, 11]], '#fffaf0'),
      [33, 9, 2, 2, '#fff1a8'],
      [0, 20, 64, 8, '#5c1f2a'],
      ...stripes(28, 12, 4, '#3a3350', '#2b2550'),
    ],
  },
  museum: {
    label: 'Musée',
    rects: [
      [0, 0, 64, 40, '#efe3c8'],
      [0, 24, 64, 1, '#c9b48a'],
      [5, 5, 14, 12, '#d9a441'],
      [6, 6, 12, 10, '#3a86ff'],
      [9, 9, 5, 5, '#f2b48c'],
      [10, 11, 1, 1, '#1d1a2f'],
      [12, 11, 1, 1, '#1d1a2f'],
      [10, 13, 3, 1, '#b34a4a'],
      [44, 4, 16, 14, '#d9a441'],
      [45, 5, 14, 12, '#4f9a3c'],
      [46, 12, 12, 5, '#3c8c2c'],
      [53, 7, 3, 3, '#ffc93c'],
      [28, 14, 8, 14, '#d8d8e0'],
      [27, 13, 10, 2, '#a7b1c2'],
      ...checker(28, 12, 8, '#e5dccb', '#d4c8b0'),
    ],
  },
  attic: {
    label: 'Grenier',
    rects: [
      [0, 0, 64, 40, '#a8743d'],
      ...stripes(0, 28, 5, '#a8743d', '#8b5a2b', true),
      [0, 0, 64, 4, '#5c3a1a'],
      [10, 4, 2, 24, '#5c3a1a'],
      [52, 4, 2, 24, '#5c3a1a'],
      [28, 6, 8, 8, '#5c3a1a'],
      [29, 7, 6, 6, '#bfe6ff'],
      [31, 7, 1, 6, '#5c3a1a'],
      [29, 9, 6, 1, '#5c3a1a'],
      [2, 20, 8, 8, '#d9a441'],
      [3, 21, 6, 1, '#8b5a2b'],
      [54, 18, 9, 10, '#c08a4f'],
      [54, 22, 9, 1, '#8b5a2b'],
      ...stripes(28, 12, 3, '#8b5a2b', '#6b4b2e'),
    ],
  },
};

export function sceneRects(scene: SceneKey): Rect[] {
  return SCENES[scene].rects;
}

export function sceneLabel(scene: SceneKey): string {
  return SCENES[scene].label;
}
