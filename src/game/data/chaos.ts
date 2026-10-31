import type { ChaosCard } from '../types';

// Les cartes Chaos imposent une contrainte à la PROCHAINE case de la cible.
// Elles ajoutent un élément visuel mais ne suppriment jamais une case existante.

export const CHAOS_CARDS: ChaosCard[] = [
  { id: 'c-witness', title: 'Un témoin surgit', constraint: 'Fais entrer un témoin dans la scène.', visual: { character: 'witness' }, botLines: ['Un témoin surgit de derrière un rideau : « J’ai tout vu ! »', 'Un témoin lève la main. Il n’était pas invité.'] },
  { id: 'c-mask', title: 'Identité secrète', constraint: 'Un personnage cache son identité.', visual: { maskCharacter: true }, botLines: ['Quelqu’un porte soudain un masque. Qui est-ce vraiment ?', 'Un personnage se présente sous un faux nom. Personne n’y croit.'] },
  { id: 'c-trial', title: 'Procès immédiat', constraint: 'La scène devient un procès.', visual: { scene: 'courtroom', character: 'judge' }, botLines: ['Coup de marteau : tout le monde est jugé sur-le-champ.', 'La scène se transforme en procès. L’accusé ? Le plus innocent.'] },
  { id: 'c-banal', title: 'Objet capital', constraint: 'Un objet banal devient essentiel.', visual: { recallProp: true }, botLines: ['Le petit objet du début devient soudain la clé de tout.', 'Cet objet sans importance ? Il était crucial depuis le début.'] },
  { id: 'c-storm', title: 'Catastrophe météo', constraint: 'Une catastrophe météo interrompt tout.', visual: { effect: 'lightning' }, botLines: ['Un orage éclate et interrompt tout le monde en pleine phrase.', 'La tempête emporte la seule preuve.'] },
  { id: 'c-teleport', title: 'Téléportation', constraint: 'Tout le monde est téléporté ailleurs.', visual: { scene: 'spaceship' }, botLines: ['ZAP ! Tout le monde est téléporté dans un vaisseau spatial.', 'Téléportation surprise : même les chaussures ont suivi.'] },
  { id: 'c-cat', title: 'Le chat prend le pouvoir', constraint: 'Un animal prend une décision importante.', visual: { character: 'cat' }, botLines: ['Le chat appuie sur le bouton. Décision prise.', 'Un chat tranche le débat d’un coup de patte.'] },
  { id: 'c-song', title: 'Tout en chanson', constraint: 'Quelqu’un doit tout dire en chantant.', visual: { effect: 'notes' }, botLines: ['Un personnage avoue tout… en chantant faux.', 'Impossible de parler normalement : tout se dit en chanson.'] },
  { id: 'c-ghost', title: 'Revenant', constraint: 'Un personnage qu’on croyait parti revient.', visual: { character: 'ghost' }, botLines: ['Un revenant passe la tête par la fenêtre : « Vous m’avez oublié ? »', 'Il était parti. Il est revenu. Plus transparent.'] },
  { id: 'c-alien', title: 'Visite inattendue', constraint: 'Un visiteur venu de très loin s’en mêle.', visual: { character: 'alien' }, botLines: ['Un visiteur d’une autre planète donne son avis. Personne ne l’a demandé.', 'Une soucoupe se pose. Son occupant prend des notes.'] },
];
