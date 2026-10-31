import { describe, expect, it } from 'vitest';
import { CHARACTER_SPRITES } from '../src/art/characters';
import { EFFECT_SPRITES, PROP_SPRITES } from '../src/art/props';
import { decideBotTurn } from '../src/game/bots';
import { CHAOS_CARDS, FINALE_CARDS, INSPIRATION_CARDS } from '../src/game/data';
import { CAPTION_MAX, currentPlayer, submitTurn } from '../src/game/engine';
import { createSoloGame } from '../src/game/session';
import type { GameState } from '../src/game/types';

/** Partie où tout le monde (humain compris) joue comme un bot. */
function autoplay(seed: number): GameState {
  let s = createSoloGame('Auto', seed);
  let guard = 0;
  while (s.phase === 'playing' && guard++ < 100) {
    const p = currentPlayer(s);
    const r = submitTurn(s, p.id, decideBotTurn(s, p.id));
    if (!r.ok) throw new Error(`${r.code} (${p.id}, graine ${seed})`);
    s = r.state;
  }
  return s;
}

describe('bots locaux', () => {
  it('jouent des parties complètes et valides sur de nombreuses graines', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const s = autoplay(seed);
      expect(s.phase).toBe('reading');
      for (const p of s.players) {
        expect(p.panels).toHaveLength(4);
        expect(p.panels.every((panel) => panel.caption.length > 0 && panel.caption.length <= CAPTION_MAX)).toBe(true);
        expect(p.panels[3].finaleId).toBeDefined();
      }
    }
  });

  it('sont reproductibles pour une même graine', () => {
    expect(autoplay(123)).toEqual(autoplay(123));
  });

  it('interagissent avec l’histoire humaine via des cartes Chaos', () => {
    let hits = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const s = autoplay(seed);
      hits += s.players[0].panels.filter((p) => p.constraint && p.constraint.fromPlayerId.startsWith('bot')).length;
    }
    expect(hits).toBeGreaterThan(0);
  });

  it('n’ont que des phrases prédéfinies pour chaque carte', () => {
    for (const card of [...INSPIRATION_CARDS, ...CHAOS_CARDS, ...FINALE_CARDS]) {
      expect(card.botLines.length).toBeGreaterThan(0);
      for (const line of card.botLines) expect(line.length).toBeLessThanOrEqual(CAPTION_MAX);
    }
  });
});

describe('sprites', () => {
  it('ont des grilles rectangulaires de la bonne taille', () => {
    for (const [key, s] of Object.entries(CHARACTER_SPRITES)) {
      expect(s.rows, key).toHaveLength(16);
      for (const row of s.rows) expect(row.length, `${key}: "${row}"`).toBe(12);
    }
    for (const [key, s] of Object.entries(PROP_SPRITES)) {
      expect(s.rows, key).toHaveLength(8);
      for (const row of s.rows) expect(row.length, `${key}: "${row}"`).toBe(8);
    }
    for (const [key, s] of Object.entries(EFFECT_SPRITES)) {
      const w = s.rows[0].length;
      for (const row of s.rows) expect(row.length, `${key}: "${row}"`).toBe(w);
    }
  });
});
