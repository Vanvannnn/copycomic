// Mise en place d'une partie de test locale : un humain + deux bots.

import { createGame } from './engine';
import type { CharacterKey, GameState, Player } from './types';

export const HUMAN_ID = 'human';
export const BOT_NAMES = ['Bot Bricole', 'Bot Pixel'];

export function createSoloGame(playerName: string, seed: number): GameState {
  return createGame(
    [
      { id: HUMAN_ID, name: playerName, isBot: false },
      ...BOT_NAMES.map((name, i) => ({ id: `bot-${i + 1}`, name, isBot: true })),
    ],
    seed,
  );
}

const AVATARS: CharacterKey[] = ['kid', 'robot', 'alien', 'grandma', 'pirate', 'chef'];

export function avatarFor(state: GameState, player: Player): CharacterKey {
  return AVATARS[state.players.findIndex((p) => p.id === player.id) % AVATARS.length];
}
