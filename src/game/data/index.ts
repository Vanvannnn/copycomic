import type { ChaosCard, FinaleCard, InspirationCard, Objective, StoryStart } from '../types';
import { CHAOS_CARDS } from './chaos';
import { FINALE_CARDS } from './finales';
import { INSPIRATION_CARDS } from './inspiration';
import { OBJECTIVES } from './objectives';
import { STORY_STARTS } from './starts';

export { CHAOS_CARDS, FINALE_CARDS, INSPIRATION_CARDS, OBJECTIVES, STORY_STARTS };

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

const inspirationById = indexById(INSPIRATION_CARDS);
const chaosById = indexById(CHAOS_CARDS);
const finaleById = indexById(FINALE_CARDS);
const objectiveById = indexById(OBJECTIVES);
const startById = indexById(STORY_STARTS);

function lookup<T>(map: Map<string, T>, id: string, label: string): T {
  const item = map.get(id);
  if (!item) throw new Error(`${label} inconnu : ${id}`);
  return item;
}

export const getInspiration = (id: string): InspirationCard => lookup(inspirationById, id, 'Carte d’inspiration');
export const getChaos = (id: string): ChaosCard => lookup(chaosById, id, 'Carte Chaos');
export const getFinale = (id: string): FinaleCard => lookup(finaleById, id, 'Carte Finale');
export const getObjective = (id: string): Objective => lookup(objectiveById, id, 'Objectif');
export const getStart = (id: string): StoryStart => lookup(startById, id, 'Départ');

export const KIND_LABELS = {
  personnage: 'Personnage',
  objet: 'Objet',
  lieu: 'Lieu',
  evenement: 'Événement',
  genre: 'Genre',
} as const;

export const GENRE_LABELS = {
  comedie: 'Comédie',
  polar: 'Polar',
  aventure: 'Aventure',
  sf: 'Science-fiction',
  romance: 'Romance',
  horreur: 'Horreur légère',
  western: 'Western',
} as const;
