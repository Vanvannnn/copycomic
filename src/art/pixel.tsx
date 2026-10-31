// Rendu de sprites pixel art : une grille de caractères + une palette → des <rect>.
// Les pixels voisins de même couleur sont fusionnés en bandes horizontales.

import type { ReactElement } from 'react';

export type Grid = readonly string[];
export type Palette = Readonly<Record<string, string>>;

interface Run {
  x: number;
  y: number;
  w: number;
  color: string;
}

const cache = new WeakMap<Grid, Map<Palette, Run[]>>();

function toRuns(rows: Grid, palette: Palette): Run[] {
  let byPalette = cache.get(rows);
  if (!byPalette) {
    byPalette = new Map();
    cache.set(rows, byPalette);
  }
  const cached = byPalette.get(palette);
  if (cached) return cached;

  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const color = palette[ch];
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      if (color) runs.push({ x, y, w, color });
      x += w;
    }
  });
  byPalette.set(palette, runs);
  return runs;
}

export function gridSize(rows: Grid): { w: number; h: number } {
  return { w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

interface GroupProps {
  rows: Grid;
  palette: Palette;
  x?: number;
  y?: number;
  flip?: boolean;
}

export function PixelGroup({ rows, palette, x = 0, y = 0, flip = false }: GroupProps): ReactElement {
  const { w } = gridSize(rows);
  const transform = flip ? `translate(${x + w} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={transform}>
      {toRuns(rows, palette).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} />
      ))}
    </g>
  );
}

interface IconProps {
  rows: Grid;
  palette: Palette;
  size?: number;
  label?: string;
  className?: string;
}

/** Sprite autonome (icônes, avatars). Décoratif si `label` est absent. */
export function PixelIcon({ rows, palette, size = 32, label, className }: IconProps): ReactElement {
  const { w, h } = gridSize(rows);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width={(size * w) / Math.max(w, h)}
      height={(size * h) / Math.max(w, h)}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <PixelGroup rows={rows} palette={palette} />
    </svg>
  );
}
