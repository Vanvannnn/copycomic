import { describe, expect, it } from 'vitest';
import { decideBotTurn, decideBotVote } from '../src/game/bots';
import { getChaos } from '../src/game/data';
import {
  CAPTION_MAX,
  castVote,
  chaosTargets,
  currentPlayer,
  finaleForTurn,
  startVoting,
  submitTurn,
} from '../src/game/engine';
import { HUMAN_ID, createSoloGame } from '../src/game/session';
import type { GameResult, GameState, TurnInput } from '../src/game/types';

function ok(result: GameResult): GameState {
  if (!result.ok) throw new Error(`${result.code}: ${result.message}`);
  return result.state;
}

function humanTurn(state: GameState, extra: Partial<TurnInput> = {}): GameState {
  const human = currentPlayer(state);
  return ok(submitTurn(state, human.id, { inspirationId: human.hand[0], caption: 'Une case de test.', ...extra }));
}

function playBots(state: GameState): GameState {
  let s = state;
  while (s.phase === 'playing' && currentPlayer(s).isBot) {
    const bot = currentPlayer(s);
    s = ok(submitTurn(s, bot.id, decideBotTurn(s, bot.id)));
  }
  return s;
}

describe('mise en place', () => {
  it('crée une partie solo à 3 joueurs avec des départs et objectifs différents', () => {
    const s = createSoloGame('Camille', 42);
    expect(s.players).toHaveLength(3);
    expect(s.players.filter((p) => p.isBot)).toHaveLength(2);
    expect(new Set(s.players.map((p) => p.startId)).size).toBe(3);
    expect(new Set(s.players.map((p) => p.objectiveId)).size).toBe(3);
    expect(s.players.every((p) => p.hand.length === 4 && p.chaosHand.length === 2)).toBe(true);
    expect(currentPlayer(s).id).toBe(HUMAN_ID);
  });

  it('est déterministe pour une même graine', () => {
    expect(createSoloGame('A', 7)).toEqual(createSoloGame('A', 7));
  });
});

describe('progression des tours', () => {
  it('refuse de jouer hors de son tour', () => {
    const s = createSoloGame('A', 1);
    const bot = s.players[1];
    const r = submitTurn(s, bot.id, { inspirationId: bot.hand[0], caption: 'x' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('NOT_YOUR_TURN');
  });

  it('refuse une légende vide ou trop longue et une carte absente de la main', () => {
    const s = createSoloGame('A', 1);
    const h = currentPlayer(s);
    const empty = submitTurn(s, h.id, { inspirationId: h.hand[0], caption: '   ' });
    const long = submitTurn(s, h.id, { inspirationId: h.hand[0], caption: 'a'.repeat(CAPTION_MAX + 1) });
    const notInHand = submitTurn(s, h.id, { inspirationId: 'g-western-inexistante', caption: 'ok' });
    expect(!empty.ok && empty.code).toBe('CAPTION_EMPTY');
    expect(!long.ok && long.code).toBe('CAPTION_TOO_LONG');
    expect(!notInHand.ok && notInHand.code).toBe('CARD_NOT_IN_HAND');
  });

  it('empêche de valider deux fois la même case (le tour passe au suivant)', () => {
    const s0 = createSoloGame('A', 3);
    const h = currentPlayer(s0);
    const s1 = humanTurn(s0);
    expect(s1.players[0].panels).toHaveLength(1);
    const again = submitTurn(s1, h.id, { inspirationId: s1.players[0].hand[0], caption: 'encore' });
    expect(!again.ok && again.code).toBe('NOT_YOUR_TURN');
  });

  it('remplace la carte jouée et enchaîne les manches jusqu’à la lecture', () => {
    let s = createSoloGame('A', 11);
    for (let round = 1; round <= 4; round++) {
      expect(s.round).toBe(round);
      const played = currentPlayer(s).hand[0];
      s = humanTurn(s);
      expect(s.players[0].hand).toHaveLength(4);
      expect(s.players[0].hand).not.toContain(played);
      s = playBots(s);
    }
    expect(s.phase).toBe('reading');
    expect(s.players.every((p) => p.panels.length === 4)).toBe(true);
  });
});

describe('cartes Chaos', () => {
  it('attache la contrainte à la prochaine case de la cible, et à elle seule', () => {
    let s = createSoloGame('A', 5);
    const h = currentPlayer(s);
    const chaosId = h.chaosHand[0];
    s = humanTurn(s, { chaos: { cardId: chaosId, targetId: 'bot-2' } });

    const target = s.players.find((p) => p.id === 'bot-2')!;
    expect(target.pendingConstraint).toEqual({ cardId: chaosId, fromPlayerId: HUMAN_ID });
    expect(s.players[0].chaosHand).toHaveLength(1);
    expect(s.players[0].chaosPlayed).toBe(1);
    expect(s.log.some((l) => l.tone === 'chaos')).toBe(true);

    // bot-1 joue : sa case n'a pas de contrainte.
    const bot1 = currentPlayer(s);
    s = ok(submitTurn(s, bot1.id, { ...decideBotTurn(s, bot1.id), chaos: undefined }));
    expect(s.players[1].panels[0].constraint).toBeUndefined();

    // bot-2 joue : la contrainte est intégrée puis retirée.
    const bot2 = currentPlayer(s);
    s = ok(submitTurn(s, bot2.id, { ...decideBotTurn(s, bot2.id), chaos: undefined }));
    const panel = s.players[2].panels[0];
    expect(panel.constraint).toEqual({ cardId: chaosId, fromPlayerId: HUMAN_ID });
    expect(s.players[2].pendingConstraint).toBeUndefined();
  });

  it('ajoute l’élément visuel imposé sans toucher aux cases existantes', () => {
    let s = createSoloGame('A', 5);
    s = humanTurn(s);
    s = playBots(s);
    const before = structuredClone(s.players[0].panels);
    // bot-1 impose « un témoin » à l'humain.
    s = { ...s, players: s.players.map((p) => (p.id === HUMAN_ID ? { ...p, pendingConstraint: { cardId: 'c-witness', fromPlayerId: 'bot-1' } } : p)) };
    s = humanTurn(s);
    expect(s.players[0].panels.slice(0, 1)).toEqual(before);
    expect(s.players[0].panels[1].composition.characters).toContain('witness');
    expect(getChaos('c-witness').visual.character).toBe('witness');
  });

  it('refuse une cible invalide : soi-même ou quelqu’un qui a déjà une contrainte', () => {
    let s = createSoloGame('A', 9);
    const h = currentPlayer(s);
    const self = submitTurn(s, h.id, { inspirationId: h.hand[0], caption: 'x', chaos: { cardId: h.chaosHand[0], targetId: HUMAN_ID } });
    expect(!self.ok && self.code).toBe('CHAOS_INVALID_TARGET');

    s = humanTurn(s, { chaos: { cardId: h.chaosHand[0], targetId: 'bot-1' } });
    expect(chaosTargets(s, 'bot-2').map((p) => p.id)).toEqual([HUMAN_ID]);
  });

  it('refuse une carte Chaos absente de la main', () => {
    const s = createSoloGame('A', 9);
    const h = currentPlayer(s);
    const unknown = ['c-witness', 'c-mask', 'c-trial'].find((id) => !h.chaosHand.includes(id))!;
    const r = submitTurn(s, h.id, { inspirationId: h.hand[0], caption: 'x', chaos: { cardId: unknown, targetId: 'bot-1' } });
    expect(!r.ok && r.code).toBe('CHAOS_NOT_IN_HAND');
  });
});

describe('Finale', () => {
  it('n’apparaît qu’à la dernière case', () => {
    let s = createSoloGame('A', 21);
    for (let round = 1; round <= 3; round++) {
      expect(finaleForTurn(s, currentPlayer(s))).toBeUndefined();
      s = playBots(humanTurn(s));
    }
    const finale = finaleForTurn(s, currentPlayer(s));
    expect(finale).toBeDefined();
    s = playBots(humanTurn(s));
    for (const p of s.players) {
      expect(p.panels.slice(0, 3).every((panel) => !panel.finaleId)).toBe(true);
      expect(p.panels[3].finaleId).toBeDefined();
    }
    expect(s.players[0].panels[3].finaleId).toBe(finale);
  });
});

describe('vote', () => {
  function finishedGame(seed = 33): GameState {
    let s = createSoloGame('A', seed);
    while (s.phase === 'playing') s = playBots(humanTurn(s));
    return ok(startVoting(s));
  }

  it('interdit de voter pour soi et de voter deux fois', () => {
    let s = finishedGame();
    const self = castVote(s, HUMAN_ID, HUMAN_ID);
    expect(!self.ok && self.code).toBe('SELF_VOTE');
    s = ok(castVote(s, HUMAN_ID, 'bot-1'));
    const twice = castVote(s, HUMAN_ID, 'bot-2');
    expect(!twice.ok && twice.code).toBe('ALREADY_VOTED');
  });

  it('passe aux résultats quand tout le monde a voté', () => {
    let s = finishedGame();
    expect(castVote(s, HUMAN_ID, 'bot-1').ok).toBe(true);
    s = ok(castVote(s, HUMAN_ID, 'bot-1'));
    expect(s.phase).toBe('voting');
    for (const bot of ['bot-1', 'bot-2']) {
      const target = decideBotVote(s, bot);
      expect(target).not.toBe(bot);
      s = ok(castVote(s, bot, target));
    }
    expect(s.phase).toBe('results');
  });

  it('refuse de voter pendant la création', () => {
    const s = createSoloGame('A', 1);
    expect(castVote(s, HUMAN_ID, 'bot-1').ok).toBe(false);
  });
});
