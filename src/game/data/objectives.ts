import type { Objective } from '../types';

// Objectifs secrets : uniquement des conditions vérifiables à partir des cartes
// jouées et de la composition des cases, jamais du sens des légendes.

export const OBJECTIVES: Objective[] = [
  { id: 'obj-genres', title: 'Mélange des genres', description: 'Ta BD traverse au moins 3 genres différents.', check: { type: 'distinctGenres', min: 3 } },
  { id: 'obj-travel', title: 'Globe-trotter', description: 'Le lieu change au moins 2 fois dans ta BD.', check: { type: 'sceneChanges', min: 2 } },
  { id: 'obj-cast', title: 'Grand casting', description: 'Au moins 4 personnages différents apparaissent dans ta BD.', check: { type: 'distinctCharacters', min: 4 } },
  { id: 'obj-props', title: 'Accessoiriste', description: 'Joue au moins 2 cartes Objet.', check: { type: 'kindPlayed', kind: 'objet', min: 2 } },
  { id: 'obj-events', title: 'Coups de théâtre', description: 'Joue au moins 2 cartes Événement.', check: { type: 'kindPlayed', kind: 'evenement', min: 2 } },
  { id: 'obj-chaos', title: 'Semeur de chaos', description: 'Joue tes 2 cartes Chaos contre les autres.', check: { type: 'chaosPlayed', min: 2 } },
  { id: 'obj-home', title: 'Casanier', description: 'La dernière case se passe dans le même lieu que la première.', check: { type: 'sameSceneStartEnd' } },
  { id: 'obj-prop', title: 'Fil rouge', description: 'Un même objet apparaît dans au moins 2 cases (les cartes « rappel » aident).', check: { type: 'propRepeated' } },
  { id: 'obj-verbose', title: 'Plume généreuse', description: 'Écris au moins une légende de 120 caractères ou plus.', check: { type: 'longCaption', minLength: 120 } },
];
