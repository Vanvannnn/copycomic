// Sauvegarde locale de la partie de test (navigateur uniquement, jamais envoyée).

import type { GameState } from './types';

const KEY = 'la-case-suivante:test-game:v1';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Stockage indisponible (navigation privée…) : la partie continue sans sauvegarde.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed?.version !== 1 || parsed.mode !== 'local-test' || !Array.isArray(parsed.players)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignoré
  }
}
