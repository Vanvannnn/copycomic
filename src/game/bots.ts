// Bots locaux : règles simples, phrases prédéfinies, aucun appel réseau.
// Leurs choix ne dépendent que de l'état de la partie et de sa graine.

import { getChaos, getFinale, getInspiration, getObjective, getStart } from './data';
import { CAPTION_MAX, chaosTargets, finaleForTurn } from './engine';
import { evaluateObjective } from './scoring';
import { hashSeed, pick } from './rng';
import type { GameState, Player, PlayerId, TurnInput } from './types';

function cardScore(player: Player, cardId: string): number {
  const card = getInspiration(cardId);
  const check = getObjective(player.objectiveId).check;
  const comp = player.panels.at(-1)?.composition;
  const start = getStart(player.startId);
  const usedGenres = new Set([start.genre, ...player.panels.map((p) => p.composition.genre)]);
  const seenCharacters = new Set([...start.characters, ...player.panels.flatMap((p) => p.composition.characters)]);

  switch (check.type) {
    case 'distinctGenres':
      return card.genre && !usedGenres.has(card.genre) ? 3 : 0;
    case 'sceneChanges':
      return card.scene && card.scene !== (comp?.scene ?? start.scene) ? 3 : 0;
    case 'distinctCharacters':
      return card.character && !seenCharacters.has(card.character) ? 3 : 0;
    case 'kindPlayed':
      return card.kind === check.kind ? 3 : 0;
    case 'sameSceneStartEnd':
      return card.scene ? -2 : 1;
    case 'propRepeated':
      if (card.recallProp && player.panels.some((p) => p.composition.prop)) return 4;
      return card.prop ? 2 : 0;
    default:
      return 0;
  }
}

function fit(text: string): string {
  return text.length <= CAPTION_MAX ? text : `${text.slice(0, CAPTION_MAX - 1).trimEnd()}…`;
}

export function decideBotTurn(state: GameState, botId: PlayerId): TurnInput {
  const bot = state.players.find((p) => p.id === botId);
  if (!bot) throw new Error(`Bot inconnu : ${botId}`);
  const seed = hashSeed(state.seed, botId, bot.panels.length);

  // 1. Carte : meilleure pour l'objectif, départage déterministe.
  const scored = bot.hand.map((id) => ({ id, score: cardScore(bot, id) }));
  const best = Math.max(...scored.map((s) => s.score));
  const inspirationId = pick(
    scored.filter((s) => s.score === best).map((s) => s.id),
    seed,
  );

  // 2. Légende : la contrainte et la Finale passent avant la carte.
  const card = getInspiration(inspirationId);
  const finaleId = finaleForTurn(state, bot);
  const lines: string[] = [];
  if (bot.pendingConstraint) lines.push(pick(getChaos(bot.pendingConstraint.cardId).botLines, seed + 1));
  if (finaleId) lines.push(pick(getFinale(finaleId).botLines, seed + 2));
  const cardLine = pick(card.botLines, seed + 3);
  // La carte jouée est mentionnée aussi quand la place le permet.
  if (lines.length === 0 || [...lines, cardLine].join(' ').length <= CAPTION_MAX) lines.push(cardLine);
  const objective = evaluateObjective(bot);
  if (getObjective(bot.objectiveId).check.type === 'longCaption' && !objective.achieved) {
    lines.push(...card.botLines.filter((l) => !lines.includes(l)));
  }
  const caption = fit(lines.join(' '));

  // 3. Chaos : manches 1 et 3 (1 et 2 pour « Semeur de chaos »), l'humain en priorité.
  let chaos: TurnInput['chaos'];
  const eager = getObjective(bot.objectiveId).check.type === 'chaosPlayed';
  const chaosRounds = eager ? [1, 2] : [1, 3];
  if (bot.chaosHand.length > 0 && chaosRounds[bot.chaosPlayed] === state.round) {
    const targets = chaosTargets(state, bot.id);
    const target = targets.find((p) => !p.isBot) ?? targets[0];
    if (target) chaos = { cardId: bot.chaosHand[0], targetId: target.id };
  }

  return { inspirationId, caption, chaos };
}

/** Vote d'un bot : la BD avec le plus de contraintes intégrées, puis la plus longue. */
export function decideBotVote(state: GameState, botId: PlayerId): PlayerId {
  const candidates = state.players.filter((p) => p.id !== botId);
  const weight = (p: Player) =>
    p.panels.filter((panel) => panel.constraint).length * 1000 +
    p.panels.reduce((sum, panel) => sum + panel.caption.length, 0);
  const sorted = [...candidates].sort((a, b) => weight(b) - weight(a) || a.id.localeCompare(b.id));
  // Un peu de variété : le second bot choisit parfois le deuxième candidat.
  const index = Math.abs(hashSeed(state.seed, botId, 'vote')) % 2 === 0 ? 0 : Math.min(1, sorted.length - 1);
  return sorted[index].id;
}
