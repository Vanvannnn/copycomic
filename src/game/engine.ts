// Règles de « La Case suivante ». Fonctions pures : chaque action renvoie un
// nouvel état ou une erreur typée, sans jamais muter l'état reçu.

import {
  CHAOS_CARDS,
  FINALE_CARDS,
  INSPIRATION_CARDS,
  OBJECTIVES,
  STORY_STARTS,
  getChaos,
  getFinale,
  getInspiration,
  getStart,
} from './data';
import { shuffle } from './rng';
import type {
  CharacterKey,
  GameErrorCode,
  GameResult,
  GameState,
  Panel,
  PanelComposition,
  Player,
  PlayerId,
  PropKey,
  TurnInput,
} from './types';

export const PANELS_PER_STORY = 4;
export const HAND_SIZE = 4;
export const CHAOS_PER_PLAYER = 2;
export const CAPTION_MAX = 180;
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;
const MAX_VISIBLE_CHARACTERS = 3;
const MAX_LOG = 40;

export interface PlayerSetup {
  id: PlayerId;
  name: string;
  isBot: boolean;
}

function fail(code: GameErrorCode, message: string): GameResult {
  return { ok: false, code, message };
}

export function createGame(setup: PlayerSetup[], seed: number): GameState {
  if (setup.length < MIN_PLAYERS || setup.length > MAX_PLAYERS) {
    throw new Error(`Une partie se joue de ${MIN_PLAYERS} à ${MAX_PLAYERS} joueurs.`);
  }
  let rng = seed | 0;
  const draw = <T>(items: readonly T[]): T[] => {
    const [shuffled, next] = shuffle(items, rng);
    rng = next;
    return shuffled;
  };
  const starts = draw(STORY_STARTS);
  const objectives = draw(OBJECTIVES);
  const deck = draw(INSPIRATION_CARDS.map((c) => c.id));
  const chaosDeck = draw(CHAOS_CARDS.map((c) => c.id));
  const finaleDeck = draw(FINALE_CARDS.map((c) => c.id));

  const players: Player[] = setup.map((p, i) => {
    const hand = deck.splice(0, HAND_SIZE);
    // Le paquet Chaos est cyclique : à 6 joueurs, deux joueurs peuvent avoir la même carte.
    const chaosHand = Array.from(
      { length: CHAOS_PER_PLAYER },
      (_, k) => chaosDeck[(i * CHAOS_PER_PLAYER + k) % chaosDeck.length],
    );
    return {
      id: p.id,
      name: p.name,
      isBot: p.isBot,
      startId: starts[i].id,
      objectiveId: objectives[i % objectives.length].id,
      hand,
      chaosHand,
      chaosPlayed: 0,
      panels: [],
    };
  });

  return {
    version: 1,
    seed,
    rngState: rng,
    mode: 'local-test',
    panelsPerStory: PANELS_PER_STORY,
    players,
    turnIndex: 0,
    round: 1,
    phase: 'playing',
    deck,
    discard: [],
    finaleDeck,
    votes: {},
    log: [{ id: 1, text: 'La partie commence ! Chacun découvre son départ d’histoire.', tone: 'info' }],
  };
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.turnIndex];
}

export function getPlayer(state: GameState, id: PlayerId): Player | undefined {
  return state.players.find((p) => p.id === id);
}

export function isFinalTurn(state: GameState, player: Player): boolean {
  return player.panels.length === state.panelsPerStory - 1;
}

/**
 * Finale visible pour le joueur actif. Elle est tirée de façon déterministe
 * mais n'est attribuée (stockée) qu'au moment où la case finale est validée.
 */
export function finaleForTurn(state: GameState, player: Player): string | undefined {
  if (state.phase !== 'playing' || !isFinalTurn(state, player)) return undefined;
  if (player.finaleId) return player.finaleId;
  const index = state.players.findIndex((p) => p.id === player.id);
  return state.finaleDeck[index % state.finaleDeck.length];
}

/** Cibles autorisées pour une carte Chaos jouée par `actorId`. */
export function chaosTargets(state: GameState, actorId: PlayerId): Player[] {
  return state.players.filter(
    (p) => p.id !== actorId && p.panels.length < state.panelsPerStory && !p.pendingConstraint,
  );
}

export function validateCaption(caption: string): { code: GameErrorCode; message: string } | null {
  const trimmed = caption.trim();
  if (trimmed.length === 0) return { code: 'CAPTION_EMPTY', message: 'Écris une légende pour ta case.' };
  if (trimmed.length > CAPTION_MAX) {
    return { code: 'CAPTION_TOO_LONG', message: `La légende dépasse ${CAPTION_MAX} caractères.` };
  }
  return null;
}

function lastProp(panels: Panel[]): PropKey | undefined {
  for (let i = panels.length - 1; i >= 0; i--) {
    const prop = panels[i].composition.prop;
    if (prop) return prop;
  }
  return undefined;
}

function withCharacter(characters: CharacterKey[], character: CharacterKey): CharacterKey[] {
  return [character, ...characters.filter((c) => c !== character)].slice(0, MAX_VISIBLE_CHARACTERS);
}

/**
 * Calcule ce que montre la nouvelle case. Ordre d'application :
 * héritage de la case précédente → carte d'inspiration → Finale → contrainte Chaos
 * (la contrainte est appliquée en dernier car elle est imposée).
 */
export function composePanel(
  player: Player,
  inspirationId: string,
  constraintCardId: string | undefined,
  finaleId: string | undefined,
): PanelComposition {
  const start = getStart(player.startId);
  const prev = player.panels.at(-1)?.composition;
  const card = getInspiration(inspirationId);

  let scene = prev?.scene ?? start.scene;
  let characters = prev ? [...prev.characters] : [...start.characters];
  let genre = prev?.genre ?? start.genre;
  let prop: PropKey | undefined;
  let masked = false;
  const effects: PanelComposition['effects'] = [];

  if (card.scene) scene = card.scene;
  if (card.character) characters = withCharacter(characters, card.character);
  if (card.genre) genre = card.genre;
  if (card.prop) prop = card.recallProp ? (lastProp(player.panels) ?? card.prop) : card.prop;
  if (card.effect) effects.push(card.effect);

  if (finaleId) {
    const finale = getFinale(finaleId);
    if (finale.echoFirst) scene = player.panels[0]?.composition.scene ?? start.scene;
    if (finale.recallProp) prop = lastProp(player.panels) ?? prop;
    if (finale.effect && !effects.includes(finale.effect)) effects.push(finale.effect);
  }

  if (constraintCardId) {
    const visual = getChaos(constraintCardId).visual;
    if (visual.scene) scene = visual.scene;
    if (visual.character) characters = withCharacter(characters, visual.character);
    if (visual.recallProp) prop = lastProp(player.panels) ?? prop ?? 'key';
    if (visual.maskCharacter) masked = true;
    if (visual.effect && !effects.includes(visual.effect)) effects.unshift(visual.effect);
  }

  return { scene, characters, masked, prop, effects: effects.slice(0, 2), genre };
}

function pushLog(state: GameState, text: string, tone: GameState['log'][number]['tone']): GameState['log'] {
  const id = (state.log.at(-1)?.id ?? 0) + 1;
  return [...state.log, { id, text, tone }].slice(-MAX_LOG);
}

/** Joue un tour complet : (Chaos optionnel) + carte d'inspiration + légende. */
export function submitTurn(state: GameState, playerId: PlayerId, input: TurnInput): GameResult {
  if (state.phase !== 'playing') return fail('NOT_PLAYING', 'Ce n’est pas le moment de créer une case.');
  const actor = currentPlayer(state);
  if (actor.id !== playerId) return fail('NOT_YOUR_TURN', 'Ce n’est pas ton tour.');
  if (!actor.hand.includes(input.inspirationId)) {
    return fail('CARD_NOT_IN_HAND', 'Choisis une carte d’inspiration dans ta main.');
  }
  const captionError = validateCaption(input.caption);
  if (captionError) return fail(captionError.code, captionError.message);

  let target: Player | undefined;
  if (input.chaos) {
    if (!actor.chaosHand.includes(input.chaos.cardId)) {
      return fail('CHAOS_NOT_IN_HAND', 'Tu n’as pas cette carte Chaos.');
    }
    target = chaosTargets(state, actor.id).find((p) => p.id === input.chaos?.targetId);
    if (!target) return fail('CHAOS_INVALID_TARGET', 'Cette personne ne peut pas recevoir de carte Chaos.');
  }

  const finaleId = finaleForTurn(state, actor);
  const constraint = actor.pendingConstraint;
  const panel: Panel = {
    index: actor.panels.length,
    caption: input.caption.trim(),
    inspirationId: input.inspirationId,
    constraint: constraint ? { cardId: constraint.cardId, fromPlayerId: constraint.fromPlayerId } : undefined,
    finaleId,
    composition: composePanel(actor, input.inspirationId, constraint?.cardId, finaleId),
  };

  // Pioche de remplacement (on remélange la défausse si besoin).
  let deck = [...state.deck];
  let discard = [...state.discard, input.inspirationId];
  let rng = state.rngState;
  if (deck.length === 0) {
    [deck, rng] = shuffle(discard, rng);
    discard = [];
  }
  const drawn = deck.shift();
  const hand = actor.hand.filter((id) => id !== input.inspirationId);
  if (drawn) hand.push(drawn);

  const next: GameState = { ...state, deck, discard, rngState: rng };
  let log = pushLog(next, `${actor.name} ajoute la case ${panel.index + 1} à sa BD.`, panel.finaleId ? 'finale' : 'info');

  const usedChaosIndex = input.chaos ? actor.chaosHand.indexOf(input.chaos.cardId) : -1;
  const players = state.players.map((p) => {
    if (p.id === actor.id) {
      return {
        ...p,
        hand,
        panels: [...p.panels, panel],
        pendingConstraint: undefined,
        finaleId: finaleId ?? p.finaleId,
        chaosHand: p.chaosHand.filter((_, i) => i !== usedChaosIndex),
        chaosPlayed: p.chaosPlayed + (input.chaos ? 1 : 0),
      };
    }
    if (target && p.id === target.id && input.chaos) {
      return { ...p, pendingConstraint: { cardId: input.chaos.cardId, fromPlayerId: actor.id } };
    }
    return p;
  });

  if (target && input.chaos) {
    const card = getChaos(input.chaos.cardId);
    log = pushLog({ ...next, log }, `Chaos ! ${actor.name} impose « ${card.title} » à ${target.name}.`, 'chaos');
  }

  return { ok: true, state: advance({ ...next, players, log }) };
}

function advance(state: GameState): GameState {
  let turnIndex = state.turnIndex + 1;
  let round = state.round;
  if (turnIndex >= state.players.length) {
    turnIndex = 0;
    round += 1;
  }
  if (round > state.panelsPerStory) {
    return {
      ...state,
      turnIndex: 0,
      round: state.panelsPerStory,
      phase: 'reading',
      log: pushLog(state, 'Toutes les BD sont terminées ! Place à la lecture.', 'finale'),
    };
  }
  return { ...state, turnIndex, round };
}

export function startVoting(state: GameState): GameResult {
  if (state.phase !== 'reading') return fail('NOT_VOTING', 'La lecture n’est pas en cours.');
  return { ok: true, state: { ...state, phase: 'voting' } };
}

export function castVote(state: GameState, voterId: PlayerId, targetId: PlayerId): GameResult {
  if (state.phase !== 'voting') return fail('NOT_VOTING', 'Le vote n’est pas ouvert.');
  if (!getPlayer(state, voterId) || !getPlayer(state, targetId)) {
    return fail('UNKNOWN_PLAYER', 'Joueur inconnu.');
  }
  if (voterId === targetId) return fail('SELF_VOTE', 'Tu ne peux pas voter pour ta propre BD.');
  if (state.votes[voterId]) return fail('ALREADY_VOTED', 'Ce vote a déjà été enregistré.');
  const votes = { ...state.votes, [voterId]: targetId };
  const everyoneVoted = state.players.every((p) => votes[p.id]);
  return { ok: true, state: { ...state, votes, phase: everyoneVoted ? 'results' : 'voting' } };
}
