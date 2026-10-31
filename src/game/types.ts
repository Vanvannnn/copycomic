// Types partagés par les règles, les bots et l'interface.

export type PlayerId = string;

export type SceneKey =
  | 'ballroom'
  | 'spaceship'
  | 'forest'
  | 'courtroom'
  | 'beach'
  | 'lab'
  | 'castle'
  | 'street'
  | 'kitchen'
  | 'train'
  | 'museum'
  | 'attic';

export type CharacterKey =
  | 'detective'
  | 'robot'
  | 'grandma'
  | 'chef'
  | 'knight'
  | 'alien'
  | 'ghost'
  | 'cat'
  | 'bride'
  | 'pirate'
  | 'scientist'
  | 'kid'
  | 'witness'
  | 'judge'
  | 'masked';

export type PropKey =
  | 'key'
  | 'cake'
  | 'umbrella'
  | 'phone'
  | 'map'
  | 'duck'
  | 'bouquet'
  | 'briefcase'
  | 'crown'
  | 'sock'
  | 'toaster'
  | 'letter';

export type EffectKey = 'lightning' | 'rain' | 'hearts' | 'question' | 'boom' | 'stars' | 'zzz' | 'notes';

export type GenreKey = 'comedie' | 'polar' | 'aventure' | 'sf' | 'romance' | 'horreur' | 'western';

export type InspirationKind = 'personnage' | 'objet' | 'lieu' | 'evenement' | 'genre';

export interface InspirationCard {
  id: string;
  kind: InspirationKind;
  title: string;
  hint: string;
  character?: CharacterKey;
  prop?: PropKey;
  scene?: SceneKey;
  effect?: EffectKey;
  genre?: GenreKey;
  /** Ramène le dernier objet déjà apparu dans la BD (prop sert de repli). */
  recallProp?: boolean;
  /** Phrases prédéfinies utilisées par les bots. */
  botLines: string[];
}

/** Modification visuelle imposée par une carte Chaos (vérifiable par le jeu). */
export interface ChaosVisual {
  character?: CharacterKey;
  scene?: SceneKey;
  effect?: EffectKey;
  /** Ré-affiche le dernier objet déjà apparu dans la BD. */
  recallProp?: boolean;
  /** Masque le premier personnage de la case. */
  maskCharacter?: boolean;
}

export interface ChaosCard {
  id: string;
  title: string;
  constraint: string;
  visual: ChaosVisual;
  botLines: string[];
}

export interface FinaleCard {
  id: string;
  title: string;
  shape: string;
  effect?: EffectKey;
  /** La dernière case reprend le décor de la première. */
  echoFirst?: boolean;
  recallProp?: boolean;
  botLines: string[];
}

export interface StoryStart {
  id: string;
  place: string;
  problem: string;
  scene: SceneKey;
  characters: CharacterKey[];
  genre: GenreKey;
}

export type ObjectiveCheck =
  | { type: 'distinctGenres'; min: number }
  | { type: 'sceneChanges'; min: number }
  | { type: 'distinctCharacters'; min: number }
  | { type: 'kindPlayed'; kind: InspirationKind; min: number }
  | { type: 'chaosPlayed'; min: number }
  | { type: 'sameSceneStartEnd' }
  | { type: 'propRepeated' }
  | { type: 'longCaption'; minLength: number };

export interface Objective {
  id: string;
  title: string;
  description: string;
  check: ObjectiveCheck;
}

/** Ce que la case montre, calculé par le moteur à partir des cartes. */
export interface PanelComposition {
  scene: SceneKey;
  characters: CharacterKey[];
  masked: boolean;
  prop?: PropKey;
  effects: EffectKey[];
  genre: GenreKey;
}

export interface AppliedConstraint {
  cardId: string;
  fromPlayerId: PlayerId;
}

export interface Panel {
  index: number;
  caption: string;
  inspirationId: string;
  constraint?: AppliedConstraint;
  finaleId?: string;
  composition: PanelComposition;
}

export interface PendingConstraint {
  cardId: string;
  fromPlayerId: PlayerId;
}

export interface Player {
  id: PlayerId;
  name: string;
  isBot: boolean;
  startId: string;
  objectiveId: string;
  hand: string[];
  chaosHand: string[];
  chaosPlayed: number;
  panels: Panel[];
  pendingConstraint?: PendingConstraint;
  /** Carte Finale attribuée au début du dernier tour de ce joueur. */
  finaleId?: string;
}

export type Phase = 'playing' | 'reading' | 'voting' | 'results';

export interface GameLogEntry {
  id: number;
  text: string;
  tone: 'info' | 'chaos' | 'finale';
}

export interface GameState {
  version: 1;
  seed: number;
  rngState: number;
  mode: 'local-test';
  panelsPerStory: number;
  players: Player[];
  /** Index du joueur actif dans players. */
  turnIndex: number;
  /** Numéro de manche (1-indexé) = numéro de la case en cours de création. */
  round: number;
  phase: Phase;
  deck: string[];
  discard: string[];
  finaleDeck: string[];
  votes: Record<PlayerId, PlayerId>;
  log: GameLogEntry[];
}

export interface TurnInput {
  inspirationId: string;
  caption: string;
  chaos?: { cardId: string; targetId: PlayerId };
}

export type GameErrorCode =
  | 'NOT_PLAYING'
  | 'NOT_YOUR_TURN'
  | 'CARD_NOT_IN_HAND'
  | 'CAPTION_EMPTY'
  | 'CAPTION_TOO_LONG'
  | 'CHAOS_NOT_IN_HAND'
  | 'CHAOS_INVALID_TARGET'
  | 'NOT_VOTING'
  | 'ALREADY_VOTED'
  | 'SELF_VOTE'
  | 'UNKNOWN_PLAYER';

export type GameResult = { ok: true; state: GameState } | { ok: false; code: GameErrorCode; message: string };

export interface ObjectiveResult {
  objective: Objective;
  achieved: boolean;
  detail: string;
}

export interface ScoreLine {
  playerId: PlayerId;
  votes: number;
  votePoints: number;
  objective: ObjectiveResult;
  objectivePoints: number;
  chaosIntegrated: number;
  chaosPoints: number;
  total: number;
}
