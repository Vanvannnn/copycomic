// Couche « salons en ligne », isolée du jeu. L'implémentation Firebase réelle
// viendra plus tard : pour l'instant, le service répond honnêtement qu'il ne
// peut pas créer ni rejoindre de salon. Il ne simule jamais de succès.

import { readFirebaseConfig, type FirebaseConfigStatus } from './firebaseConfig';

export type RoomErrorCode = 'FIREBASE_NOT_CONFIGURED' | 'MULTIPLAYER_NOT_IMPLEMENTED' | 'INVALID_ROOM_CODE';

export interface RoomError {
  code: RoomErrorCode;
  title: string;
  message: string;
}

export interface RoomInfo {
  code: string;
  hostName: string;
}

export type RoomResult<T> = { ok: true; value: T } | { ok: false; error: RoomError };

export interface RoomService {
  /** Vérifie que le multijoueur en ligne est utilisable avant d'afficher un formulaire. */
  checkAvailability(): RoomResult<void>;
  createRoom(hostName: string): Promise<RoomResult<RoomInfo>>;
  joinRoom(code: string, playerName: string): Promise<RoomResult<RoomInfo>>;
}

export const ROOM_ERRORS = {
  FIREBASE_NOT_CONFIGURED: {
    code: 'FIREBASE_NOT_CONFIGURED',
    title: 'Multijoueur en ligne indisponible',
    message:
      'Le multijoueur en ligne n’est pas encore disponible : Firebase n’est pas configurée pour cette version. ' +
      'Tu peux toujours essayer le jeu en local avec le mode test.',
  },
  MULTIPLAYER_NOT_IMPLEMENTED: {
    code: 'MULTIPLAYER_NOT_IMPLEMENTED',
    title: 'Multijoueur pas encore implémenté',
    message:
      'Une configuration Firebase a été détectée, mais les salons en ligne ne sont pas encore implémentés dans ce prototype. ' +
      'Aucun salon n’a été créé ni rejoint.',
  },
  INVALID_ROOM_CODE: {
    code: 'INVALID_ROOM_CODE',
    title: 'Code de salon invalide',
    message: 'Un code de salon contient 4 à 8 lettres ou chiffres.',
  },
} as const satisfies Record<RoomErrorCode, RoomError>;

const failure = <T>(code: RoomErrorCode): RoomResult<T> => ({ ok: false, error: ROOM_ERRORS[code] });

export function createRoomService(status: FirebaseConfigStatus): RoomService {
  const unavailable = <T>(): RoomResult<T> =>
    status.configured ? failure('MULTIPLAYER_NOT_IMPLEMENTED') : failure('FIREBASE_NOT_CONFIGURED');

  return {
    checkAvailability: () => unavailable<void>(),
    createRoom: async () => unavailable<RoomInfo>(),
    joinRoom: async (code) => {
      if (!/^[A-Za-z0-9]{4,8}$/.test(code.trim())) return failure('INVALID_ROOM_CODE');
      return unavailable<RoomInfo>();
    },
  };
}

export const roomService: RoomService = createRoomService(readFirebaseConfig(import.meta.env));
