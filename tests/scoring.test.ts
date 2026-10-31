import { describe, expect, it } from 'vitest';
import { createSoloGame } from '../src/game/session';
import { computeScores, evaluateObjective, rankScores } from '../src/game/scoring';
import type { GameState, Panel, PanelComposition, Player } from '../src/game/types';

function panel(index: number, comp: Partial<PanelComposition>, extra: Partial<Panel> = {}): Panel {
  return {
    index,
    caption: 'Légende',
    inspirationId: 'p-robot',
    composition: { scene: 'ballroom', characters: ['bride'], masked: false, effects: [], genre: 'comedie', ...comp },
    ...extra,
  };
}

function withPlayer(objectiveId: string, panels: Panel[], extra: Partial<Player> = {}): Player {
  const base = createSoloGame('A', 1).players[0];
  return { ...base, objectiveId, panels, ...extra };
}

describe('objectifs secrets', () => {
  it('compte les genres différents', () => {
    const p = withPlayer('obj-genres', [panel(0, {}), panel(1, { genre: 'polar' }), panel(2, { genre: 'sf' }), panel(3, { genre: 'sf' })]);
    expect(evaluateObjective(p).achieved).toBe(true);
    const q = withPlayer('obj-genres', [panel(0, {}), panel(1, { genre: 'polar' })]);
    expect(evaluateObjective(q)).toMatchObject({ achieved: false, detail: '2/3 genres' });
  });

  it('compte les changements de lieu', () => {
    const p = withPlayer('obj-travel', [panel(0, {}), panel(1, { scene: 'beach' }), panel(2, { scene: 'beach' }), panel(3, { scene: 'lab' })]);
    expect(evaluateObjective(p).achieved).toBe(true);
  });

  it('compte les personnages distincts', () => {
    const p = withPlayer('obj-cast', [panel(0, { characters: ['bride', 'cat'] }), panel(1, { characters: ['robot', 'cat'] }), panel(2, { characters: ['ghost'] })]);
    expect(evaluateObjective(p)).toMatchObject({ achieved: true, detail: '4/4 personnages' });
  });

  it('compte les cartes Objet jouées', () => {
    const p = withPlayer('obj-props', [panel(0, {}, { inspirationId: 'o-key' }), panel(1, {}, { inspirationId: 'o-cake' })]);
    expect(evaluateObjective(p).achieved).toBe(true);
  });

  it('vérifie le même lieu au début et à la fin', () => {
    const yes = withPlayer('obj-home', [panel(0, {}), panel(1, { scene: 'lab' }), panel(2, {}), panel(3, {})]);
    const no = withPlayer('obj-home', [panel(0, {}), panel(1, {}), panel(2, {}), panel(3, { scene: 'lab' })]);
    expect(evaluateObjective(yes).achieved).toBe(true);
    expect(evaluateObjective(no).achieved).toBe(false);
  });

  it('détecte un objet répété', () => {
    const p = withPlayer('obj-prop', [panel(0, { prop: 'duck' }), panel(1, {}), panel(2, { prop: 'duck' })]);
    expect(evaluateObjective(p).achieved).toBe(true);
  });

  it('compte les cartes Chaos jouées et la longueur des légendes', () => {
    expect(evaluateObjective(withPlayer('obj-chaos', [], { chaosPlayed: 2 })).achieved).toBe(true);
    expect(evaluateObjective(withPlayer('obj-verbose', [panel(0, {}, { caption: 'x'.repeat(120) })])).achieved).toBe(true);
    expect(evaluateObjective(withPlayer('obj-verbose', [panel(0, {}, { caption: 'x'.repeat(119) })])).achieved).toBe(false);
  });
});

describe('scores', () => {
  it('additionne votes (3), objectif (2) et contraintes intégrées (1)', () => {
    const base = createSoloGame('A', 1);
    const constrained = panel(0, {}, { constraint: { cardId: 'c-witness', fromPlayerId: 'bot-1' } });
    const state: GameState = {
      ...base,
      phase: 'results',
      players: [
        { ...base.players[0], objectiveId: 'obj-chaos', chaosPlayed: 2, panels: [constrained, panel(1, {})] },
        { ...base.players[1], objectiveId: 'obj-verbose', panels: [panel(0, {})] },
        { ...base.players[2], objectiveId: 'obj-verbose', panels: [panel(0, {})] },
      ],
      votes: { human: 'bot-1', 'bot-1': 'human', 'bot-2': 'human' },
    };
    const lines = computeScores(state);
    const human = lines.find((l) => l.playerId === 'human')!;
    expect(human).toMatchObject({ votes: 2, votePoints: 6, objectivePoints: 2, chaosIntegrated: 1, chaosPoints: 1, total: 9 });
    const bot1 = lines.find((l) => l.playerId === 'bot-1')!;
    expect(bot1.total).toBe(3);

    const ranking = rankScores(lines);
    expect(ranking[0]).toMatchObject({ playerId: 'human', rank: 1 });
    expect(ranking[1]).toMatchObject({ playerId: 'bot-1', rank: 2 });
    expect(ranking[2]).toMatchObject({ playerId: 'bot-2', rank: 3 });
  });

  it('partage le rang en cas d’égalité parfaite', () => {
    const base = createSoloGame('A', 1);
    const state: GameState = {
      ...base,
      players: base.players.map((p) => ({ ...p, objectiveId: 'obj-verbose', panels: [panel(0, {})] })),
      votes: { human: 'bot-1', 'bot-1': 'bot-2', 'bot-2': 'human' },
    };
    const ranking = rankScores(computeScores(state));
    expect(ranking.every((r) => r.rank === 1)).toBe(true);
  });
});
