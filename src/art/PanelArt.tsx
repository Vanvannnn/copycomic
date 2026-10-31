import type { ReactElement } from 'react';
import type { GenreKey, PanelComposition } from '../game/types';
import { CHARACTER_SPRITES } from './characters';
import { PixelGroup } from './pixel';
import { EFFECT_SPRITES, PROP_PALETTE, PROP_SPRITES } from './props';
import { SCENE_H, SCENE_W, sceneLabel, sceneRects } from './scenes';

// Teinte légère par genre : pas de flou, juste un calque coloré semi-transparent.
const GENRE_TINT: Record<GenreKey, { color: string; opacity: number }> = {
  comedie: { color: '#ffe066', opacity: 0.08 },
  polar: { color: '#2b2d42', opacity: 0.32 },
  aventure: { color: '#ff9f1c', opacity: 0.14 },
  sf: { color: '#00d1ff', opacity: 0.16 },
  romance: { color: '#ff8fab', opacity: 0.2 },
  horreur: { color: '#3c096c', opacity: 0.38 },
  western: { color: '#d9a441', opacity: 0.24 },
};

const CHARACTER_SLOTS = [[26], [16, 36], [6, 26, 46]] as const;
const EFFECT_SLOTS = [
  [4, 3],
  [48, 3],
] as const;

export function describeComposition(c: PanelComposition): string {
  const who = c.characters.map((k) => CHARACTER_SPRITES[k].label).join(', ');
  const prop = c.prop ? `, objet : ${PROP_SPRITES[c.prop].label}` : '';
  const fx = c.effects.length ? `, effet : ${c.effects.map((e) => EFFECT_SPRITES[e].label).join(', ')}` : '';
  const mask = c.masked ? ' (un personnage est masqué)' : '';
  return `${sceneLabel(c.scene)} avec ${who}${prop}${fx}${mask}`;
}

export function PanelArt({ composition }: { composition: PanelComposition }): ReactElement {
  const slots = CHARACTER_SLOTS[Math.min(composition.characters.length, 3) - 1] ?? CHARACTER_SLOTS[0];
  const tint = GENRE_TINT[composition.genre];
  return (
    <svg
      className="panel-art"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={describeComposition(composition)}
      preserveAspectRatio="xMidYMid slice"
    >
      {sceneRects(composition.scene).map(([x, y, w, h, color], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={color} />
      ))}
      {composition.characters.slice(0, 3).map((key, i) => {
        const sprite = CHARACTER_SPRITES[key];
        const x = slots[i];
        return (
          <g key={`${key}-${i}`}>
            <PixelGroup rows={sprite.rows} palette={sprite.palette} x={x} y={22} flip={i % 2 === 1} />
            {composition.masked && i === 0 && (
              <>
                <rect x={x + 2} y={24} width={8} height={3} fill="#1d1a2f" />
                <rect x={x + 3} y={25} width={2} height={1} fill="#fffaf0" />
                <rect x={x + 7} y={25} width={2} height={1} fill="#fffaf0" />
              </>
            )}
          </g>
        );
      })}
      {composition.prop && (
        <g>
          <rect x={slots.length === 2 ? 28 : 18} y={36} width={10} height={2} fill="#1d1a2f" opacity={0.25} />
          <PixelGroup rows={PROP_SPRITES[composition.prop].rows} palette={PROP_PALETTE} x={slots.length === 2 ? 29 : 18} y={29} />
        </g>
      )}
      {composition.effects.map((fx, i) => (
        <PixelGroup key={fx} rows={EFFECT_SPRITES[fx].rows} palette={PROP_PALETTE} x={EFFECT_SLOTS[i][0]} y={EFFECT_SLOTS[i][1]} />
      ))}
      <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={tint.color} opacity={tint.opacity} />
    </svg>
  );
}
