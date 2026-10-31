// Évaluation des objectifs secrets et calcul des scores : code déterministe,
// basé uniquement sur les cartes jouées et la composition des cases.

import { getInspiration, getObjective } from './data';
import type { GameState, Objective, ObjectiveResult, Player, PlayerId, ScoreLine } from './types';

export const POINTS_PER_VOTE = 3;
export const POINTS_PER_OBJECTIVE = 2;
export const POINTS_PER_CHAOS_INTEGRATED = 1;

function result(objective: Objective, value: number, target: number, unit: string): ObjectiveResult {
  return { objective, achieved: value >= target, detail: `${value}/${target} ${unit}` };
}

export function evaluateObjective(player: Player): ObjectiveResult {
  const objective = getObjective(player.objectiveId);
  const panels = player.panels;
  const check = objective.check;

  switch (check.type) {
    case 'distinctGenres': {
      const genres = new Set(panels.map((p) => p.composition.genre));
      return result(objective, genres.size, check.min, 'genres');
    }
    case 'sceneChanges': {
      let changes = 0;
      panels.forEach((p, i) => {
        if (i > 0 && p.composition.scene !== panels[i - 1].composition.scene) changes++;
      });
      return result(objective, changes, check.min, 'changements de lieu');
    }
    case 'distinctCharacters': {
      const characters = new Set(panels.flatMap((p) => p.composition.characters));
      return result(objective, characters.size, check.min, 'personnages');
    }
    case 'kindPlayed': {
      const count = panels.filter((p) => getInspiration(p.inspirationId).kind === check.kind).length;
      return result(objective, count, check.min, 'cartes');
    }
    case 'chaosPlayed':
      return result(objective, player.chaosPlayed, check.min, 'cartes Chaos jouées');
    case 'sameSceneStartEnd': {
      const first = panels[0]?.composition.scene;
      const last = panels.at(-1)?.composition.scene;
      const achieved = panels.length > 1 && first === last;
      return { objective, achieved, detail: achieved ? 'même lieu au début et à la fin' : 'le lieu final diffère' };
    }
    case 'propRepeated': {
      const counts = new Map<string, number>();
      for (const p of panels) {
        if (p.composition.prop) counts.set(p.composition.prop, (counts.get(p.composition.prop) ?? 0) + 1);
      }
      const best = Math.max(0, ...counts.values());
      return result(objective, best, 2, 'apparitions du même objet');
    }
    case 'longCaption': {
      const longest = Math.max(0, ...panels.map((p) => p.caption.length));
      return result(objective, longest, check.minLength, 'caractères (plus longue légende)');
    }
  }
}

export function votesReceived(state: GameState, playerId: PlayerId): number {
  return Object.values(state.votes).filter((target) => target === playerId).length;
}

export function computeScores(state: GameState): ScoreLine[] {
  return state.players.map((player) => {
    const votes = votesReceived(state, player.id);
    const objective = evaluateObjective(player);
    const chaosIntegrated = player.panels.filter((p) => p.constraint).length;
    const votePoints = votes * POINTS_PER_VOTE;
    const objectivePoints = objective.achieved ? POINTS_PER_OBJECTIVE : 0;
    const chaosPoints = chaosIntegrated * POINTS_PER_CHAOS_INTEGRATED;
    return {
      playerId: player.id,
      votes,
      votePoints,
      objective,
      objectivePoints,
      chaosIntegrated,
      chaosPoints,
      total: votePoints + objectivePoints + chaosPoints,
    };
  });
}

/** Classement : total décroissant, puis votes ; les égalités partagent le rang. */
export function rankScores(lines: ScoreLine[]): (ScoreLine & { rank: number })[] {
  const sorted = [...lines].sort((a, b) => b.total - a.total || b.votes - a.votes);
  return sorted.map((line, i) => {
    const firstEqual = sorted.findIndex((l) => l.total === line.total && l.votes === line.votes);
    return { ...line, rank: (firstEqual === -1 ? i : firstEqual) + 1 };
  });
}
