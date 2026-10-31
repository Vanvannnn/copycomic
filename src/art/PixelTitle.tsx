import type { ReactElement } from 'react';

// Police pixel 5×7 limitée aux lettres du titre.
const GLYPHS: Record<string, string[]> = {
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
};

const COLORS = ['#ff5a4e', '#ffc93c', '#2ec4b6', '#6c4ab6', '#3a86ff'];

function layout(text: string): { x: number; glyph: string[] }[] {
  let x = 0;
  return [...text].map((ch) => {
    const glyph = GLYPHS[ch] ?? GLYPHS[' '];
    const item = { x, glyph };
    x += glyph[0].length + 1;
    return item;
  });
}

function lineWidth(text: string): number {
  return layout(text).reduce((w, g) => Math.max(w, g.x + g.glyph[0].length), 0);
}

export function PixelTitle({ lines }: { lines: string[] }): ReactElement {
  const width = Math.max(...lines.map(lineWidth)) + 1;
  const height = lines.length * 9;
  let colorIndex = 0;
  const pixels: { x: number; y: number; color: string }[] = [];
  lines.forEach((line, row) => {
    const offset = Math.floor((width - 1 - lineWidth(line)) / 2);
    layout(line).forEach(({ x, glyph }) => {
      if (glyph === GLYPHS[' ']) return;
      const color = COLORS[colorIndex++ % COLORS.length];
      glyph.forEach((r, gy) =>
        [...r].forEach((c, gx) => {
          if (c === '#') pixels.push({ x: offset + x + gx, y: row * 9 + gy, color });
        }),
      );
    });
  });
  return (
    <svg
      className="pixel-title"
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={lines.join(' ')}
    >
      {pixels.map((p, i) => (
        <rect key={`s${i}`} x={p.x + 1} y={p.y + 1} width={1} height={1} fill="#1d1a2f" />
      ))}
      {pixels.map((p, i) => (
        <rect key={`c${i}`} x={p.x} y={p.y} width={1} height={1} fill={p.color} />
      ))}
    </svg>
  );
}
