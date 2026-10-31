import type { FinaleCard } from '../types';

// Une Finale donne une FORME à la dernière case, jamais la conclusion elle-même.

export const FINALE_CARDS: FinaleCard[] = [
  { id: 'f-reveal', title: 'Révélation', shape: 'Une révélation inattendue.', effect: 'question', botLines: ['Révélation : le coupable était là depuis la première case.', 'Le masque tombe… et c’est la dernière personne qu’on attendait.'] },
  { id: 'f-banal', title: 'Tout était lié', shape: 'Tout était lié à un objet banal.', recallProp: true, botLines: ['Tout s’explique : depuis le début, il s’agissait de cet objet ridicule.', 'Fin de l’histoire : la clé du mystère tenait dans une poche.'] },
  { id: 'f-worst', title: 'Pire solution', shape: 'Le problème se résout de la pire façon possible.', effect: 'boom', botLines: ['Problème résolu ! En détruisant absolument tout.', 'C’est réglé. Personne n’est content, mais c’est réglé.'] },
  { id: 'f-echo', title: 'Écho', shape: 'La dernière case fait écho à la première.', echoFirst: true, botLines: ['Retour au point de départ… mais plus rien n’est pareil.', 'Tout recommence comme au début. Le chat, lui, a compris.'] },
  { id: 'f-party', title: 'Fête générale', shape: 'Tout finit en fête que personne n’avait prévue.', effect: 'notes', botLines: ['Et tout le monde finit par danser, même le suspect.', 'Rideau : une fête improvisée, personne ne sait qui paie.'] },
  { id: 'f-twist', title: 'Rien n’était réel', shape: 'On découvre que la situation n’était pas ce qu’on croyait.', effect: 'zzz', botLines: ['Ce n’était qu’un rêve… mais pourquoi le gâteau est-il réel ?', 'Tout était une répétition de théâtre. La vraie pièce commence demain.'] },
  { id: 'f-love', title: 'Happy end', shape: 'Une fin heureuse, mais pour la mauvaise personne.', effect: 'hearts', botLines: ['Ils vécurent heureux. Pas ceux qu’on croyait.', 'Happy end ! Pour le témoin, surtout.'] },
  { id: 'f-sequel', title: 'À suivre…', shape: 'La fin ouvre un mystère encore plus grand.', effect: 'stars', botLines: ['Fin ? Pas vraiment : une nouvelle lettre arrive. À suivre…', 'Tout est résolu. Puis le téléphone sonne.'] },
];
