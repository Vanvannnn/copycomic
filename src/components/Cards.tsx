import type { ReactNode } from 'react';
import { CHARACTER_SPRITES } from '../art/characters';
import { PixelIcon } from '../art/pixel';
import { EFFECT_SPRITES, PROP_PALETTE, PROP_SPRITES } from '../art/props';
import { SCENE_H, SCENE_W, sceneRects } from '../art/scenes';
import { GENRE_LABELS, KIND_LABELS } from '../game/data';
import type { ChaosCard, FinaleCard, InspirationCard } from '../game/types';

function SceneThumb({ scene }: { scene: NonNullable<InspirationCard['scene']> }) {
  return (
    <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} width={48} height={30} shapeRendering="crispEdges" aria-hidden="true">
      {sceneRects(scene).map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </svg>
  );
}

function CardArt({ card }: { card: InspirationCard }) {
  if (card.character) {
    const s = CHARACTER_SPRITES[card.character];
    return <PixelIcon rows={s.rows} palette={s.palette} size={40} />;
  }
  if (card.prop) return <PixelIcon rows={PROP_SPRITES[card.prop].rows} palette={PROP_PALETTE} size={32} />;
  if (card.scene) return <SceneThumb scene={card.scene} />;
  if (card.effect) return <PixelIcon rows={EFFECT_SPRITES[card.effect].rows} palette={PROP_PALETTE} size={32} />;
  return <span className={`genre-swatch genre-${card.genre}`} aria-hidden="true" />;
}

interface SelectableProps {
  name: string;
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function SelectableCard({
  name,
  checked,
  onSelect,
  disabled,
  className,
  children,
  value,
}: SelectableProps & { className: string; children: ReactNode; value: string }) {
  return (
    <label className={`game-card ${className}${checked ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}>
      <input
        type="radio"
        className="visually-hidden"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
      />
      {children}
      {checked && (
        <span className="check" aria-hidden="true">
          ✓
        </span>
      )}
    </label>
  );
}

export function InspirationCardView({ card, ...props }: SelectableProps & { card: InspirationCard }) {
  return (
    <SelectableCard {...props} value={card.id} className={`kind-${card.kind}`}>
      <span className="card-kind">
        {KIND_LABELS[card.kind]}
        {card.genre ? ` · ${GENRE_LABELS[card.genre]}` : ''}
      </span>
      <span className="card-art">
        <CardArt card={card} />
      </span>
      <span className="card-title">{card.title}</span>
      <span className="card-hint">{card.hint}</span>
    </SelectableCard>
  );
}

export function ChaosCardView({ card, ...props }: SelectableProps & { card: ChaosCard }) {
  return (
    <SelectableCard {...props} value={card.id} className="chaos-card">
      <span className="card-kind">Chaos</span>
      <span className="card-title">{card.title}</span>
      <span className="card-hint">{card.constraint}</span>
    </SelectableCard>
  );
}

export function FinaleCardView({ card }: { card: FinaleCard }) {
  return (
    <div className="game-card finale-card is-revealed">
      <span className="card-kind">Finale</span>
      <span className="card-title">{card.title}</span>
      <span className="card-hint">{card.shape}</span>
    </div>
  );
}
