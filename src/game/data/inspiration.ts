import type { InspirationCard } from '../types';

// Cartes d'inspiration : chaque carte modifie la composition visuelle de la case
// (personnage, objet, lieu, effet ou genre) et propose une idée au joueur.

export const INSPIRATION_CARDS: InspirationCard[] = [
  // Personnages
  { id: 'p-detective', kind: 'personnage', title: 'Une détective', hint: 'Elle remarque tout, sauf l’évidence.', character: 'detective', botLines: ['Une détective débarque et note tout dans un carnet trop petit.', 'La détective renifle l’air : « Ça sent le mensonge… et la soupe. »'] },
  { id: 'p-robot', kind: 'personnage', title: 'Un robot poli', hint: 'Il s’excuse avant chaque catastrophe.', character: 'robot', botLines: ['Un robot entre : « Veuillez excuser l’incendie à venir. »', 'Le robot range tout par ordre alphabétique, y compris les gens.'] },
  { id: 'p-grandma', kind: 'personnage', title: 'Une mamie intrépide', hint: 'Elle a déjà tout vu. Deux fois.', character: 'grandma', botLines: ['Mamie Josette arrive en trottinette : « J’ai connu pire en 1974. »', 'Une mamie sort une sacoche pleine de bonbons et de mystères.'] },
  { id: 'p-chef', kind: 'personnage', title: 'Un chef étoilé', hint: 'Il goûte tout. Vraiment tout.', character: 'chef', botLines: ['Un chef goûte l’indice et déclare qu’il manque de sel.', 'Le chef propose de résoudre l’affaire par un soufflé.'] },
  { id: 'p-knight', kind: 'personnage', title: 'Un chevalier perdu', hint: 'Il cherche un dragon depuis 600 ans.', character: 'knight', botLines: ['Un chevalier en armure demande poliment où se trouve le dragon.', 'Le chevalier défie une plante verte en duel.'] },
  { id: 'p-alien', kind: 'personnage', title: 'Un touriste extraterrestre', hint: 'Il prend tout en photo.', character: 'alien', botLines: ['Un extraterrestre en vacances demande où sont les toilettes.', 'Le touriste venu d’ailleurs trouve ça « très pittoresque ».'] },
  { id: 'p-ghost', kind: 'personnage', title: 'Un fantôme timide', hint: 'Il hante à mi-temps.', character: 'ghost', botLines: ['Un petit fantôme traverse le mur… et s’excuse.', 'Le fantôme murmure un indice, mais personne ne l’entend.'] },
  { id: 'p-cat', kind: 'personnage', title: 'Un chat qui sait', hint: 'Il ne dira rien. Ou peut-être que si.', character: 'cat', botLines: ['Un chat s’assoit au milieu de la scène. Il sait quelque chose.', 'Le chat renverse un verre. Coïncidence ? Non.'] },
  { id: 'p-pirate', kind: 'personnage', title: 'Une pirate retraitée', hint: 'Elle a gardé un trésor… et des rancunes.', character: 'pirate', botLines: ['Une pirate retraitée réclame sa part du butin. Quel butin ?', 'La pirate sort une longue-vue : « Terre ! Enfin, moquette. »'] },
  { id: 'p-scientist', kind: 'personnage', title: 'Un savant distrait', hint: 'Il a inventé un truc. Il ne sait plus quoi.', character: 'scientist', botLines: ['Un savant entre en courant : « Ne touchez surtout pas au bouton ! »', 'Le savant cherche ses lunettes. Elles sont sur sa tête.'] },
  { id: 'p-kid', kind: 'personnage', title: 'Une enfant curieuse', hint: 'Elle pose LA question qui fâche.', character: 'kid', botLines: ['Une enfant demande : « Mais pourquoi personne ne dit la vérité ? »', 'La petite pointe du doigt la seule chose que personne n’avait vue.'] },
  { id: 'p-bride', kind: 'personnage', title: 'Une mariée pressée', hint: 'Elle doit se marier dans dix minutes.', character: 'bride', botLines: ['Une mariée surgit : « Quelqu’un a vu mon futur mari ? »', 'La mariée lance son bouquet. Il atterrit au pire endroit.'] },

  // Objets
  { id: 'o-key', kind: 'objet', title: 'Une clé dorée', hint: 'Elle n’ouvre rien. Pour l’instant.', prop: 'key', botLines: ['Une clé dorée tombe du plafond. Personne ne la réclame.', 'Quelqu’un trouve une clé qui n’ouvre aucune porte connue.'] },
  { id: 'o-cake', kind: 'objet', title: 'Un gâteau suspect', hint: 'Trois étages, une bougie de trop.', prop: 'cake', botLines: ['Un gâteau à trois étages apparaît. Il tremble légèrement.', 'Le gâteau contient visiblement quelque chose. Ou quelqu’un.'] },
  { id: 'o-umbrella', kind: 'objet', title: 'Un parapluie rouge', hint: 'Il s’ouvre tout seul.', prop: 'umbrella', botLines: ['Un parapluie rouge s’ouvre tout seul, en pleine conversation.', 'Sous le parapluie, une étiquette : « Ne pas rendre ».'] },
  { id: 'o-phone', kind: 'objet', title: 'Un téléphone qui sonne', hint: 'Numéro masqué. Insistant.', prop: 'phone', botLines: ['Un téléphone sonne. Au bout du fil : quelqu’un qui chuchote « encore toi ? »', 'Le téléphone affiche 47 appels manqués de « Maman ».'] },
  { id: 'o-map', kind: 'objet', title: 'Une carte au trésor', hint: 'Le X est sur la case suivante.', prop: 'map', botLines: ['Une carte au trésor indique un X… exactement ici.', 'La carte est à l’envers. Ça change tout.'] },
  { id: 'o-duck', kind: 'objet', title: 'Un canard en plastique', hint: 'Il couine au mauvais moment.', prop: 'duck', botLines: ['Un canard en plastique couine. Tout le monde se fige.', 'Le canard en plastique flotte, alors qu’il n’y a pas d’eau.'] },
  { id: 'o-bouquet', kind: 'objet', title: 'Un bouquet anonyme', hint: 'La carte dit juste : « Tu sais. »', prop: 'bouquet', botLines: ['Un bouquet arrive avec une carte : « Tu sais pourquoi. »', 'Le bouquet éternue.'] },
  { id: 'o-briefcase', kind: 'objet', title: 'Une mallette', hint: 'Code à 4 chiffres. 0000 ?', prop: 'briefcase', botLines: ['Une mallette verrouillée change de mains trois fois.', 'Dans la mallette : un sandwich et un plan très précis.'] },
  { id: 'o-crown', kind: 'objet', title: 'Une couronne en carton', hint: 'Celui qui la porte commande.', prop: 'crown', botLines: ['Quelqu’un pose une couronne en carton sur sa tête. Tout le monde obéit.', 'La couronne glisse sur la mauvaise tête.'] },
  { id: 'o-sock', kind: 'objet', title: 'Une chaussette orpheline', hint: 'Où est l’autre ?', prop: 'sock', botLines: ['Une chaussette orpheline est retrouvée sur les lieux.', 'La chaussette porte des initiales brodées.'] },
  { id: 'o-toaster', kind: 'objet', title: 'Un grille-pain prophète', hint: 'Ses toasts prédisent l’avenir.', prop: 'toaster', botLines: ['Le grille-pain éjecte un toast où est gravé un nom.', 'Un grille-pain fume. Le message est clair : danger.'] },
  { id: 'o-again', kind: 'objet', title: 'Encore lui !', hint: 'Le dernier objet apparu revient.', prop: 'sock', recallProp: true, botLines: ['Encore cet objet ! Il revient comme un boomerang.', 'L’objet de tout à l’heure réapparaît, plus suspect que jamais.'] },
  { id: 'o-again2', kind: 'objet', title: 'Retour à l’envoyeur', hint: 'Un objet déjà vu revient au pire moment.', prop: 'letter', recallProp: true, botLines: ['On croyait s’en être débarrassé… l’objet est de retour.', 'Retour à l’envoyeur : l’objet revient avec un mot d’excuse.'] },
  { id: 'o-letter', kind: 'objet', title: 'Une lettre cachetée', hint: 'À n’ouvrir qu’en cas d’urgence.', prop: 'letter', botLines: ['Une lettre cachetée glisse sous la porte.', 'La lettre dit seulement : « Retourne-toi. »'] },

  // Lieux
  { id: 'l-spaceship', kind: 'lieu', title: 'Direction l’espace', hint: 'La scène décolle.', scene: 'spaceship', botLines: ['Soudain, tout le monde se retrouve à bord d’un vaisseau spatial.', 'La pièce décolle. Littéralement.'] },
  { id: 'l-forest', kind: 'lieu', title: 'Une forêt profonde', hint: 'On s’y perd facilement.', scene: 'forest', botLines: ['La piste mène au cœur d’une forêt où les arbres chuchotent.', 'Changement de décor : une forêt très, très sombre.'] },
  { id: 'l-courtroom', kind: 'lieu', title: 'Au tribunal', hint: 'L’audience est ouverte.', scene: 'courtroom', botLines: ['Tout ce petit monde se retrouve au tribunal.', 'Le juge tape du marteau : l’audience commence.'] },
  { id: 'l-beach', kind: 'lieu', title: 'À la plage', hint: 'Avec ou sans parasol.', scene: 'beach', botLines: ['L’enquête continue… sur une plage.', 'Tout le monde se retrouve les pieds dans le sable.'] },
  { id: 'l-castle', kind: 'lieu', title: 'Un vieux château', hint: 'Chaque porte grince.', scene: 'castle', botLines: ['Direction un château où chaque porte grince en fa dièse.', 'Le château a l’air abandonné. Il ne l’est pas.'] },
  { id: 'l-kitchen', kind: 'lieu', title: 'En cuisine', hint: 'Ça sent bon et ça brûle.', scene: 'kitchen', botLines: ['La poursuite traverse une cuisine en plein service.', 'Tout se joue désormais entre deux casseroles.'] },
  { id: 'l-train', kind: 'lieu', title: 'Dans un train', hint: 'Prochain arrêt : nulle part.', scene: 'train', botLines: ['Tout le monde saute dans un train en marche.', 'Le train siffle. Personne n’a de billet.'] },
  { id: 'l-museum', kind: 'lieu', title: 'Au musée', hint: 'Ne touchez à rien.', scene: 'museum', botLines: ['La scène se déplace au musée, après la fermeture.', 'Dans le musée, une statue a bougé.'] },
  { id: 'l-lab', kind: 'lieu', title: 'Un labo clignotant', hint: 'Tous les boutons sont rouges.', scene: 'lab', botLines: ['Direction un laboratoire plein de boutons rouges.', 'Le labo clignote. Une alarme chante faux.'] },

  // Événements
  { id: 'e-storm', kind: 'evenement', title: 'Un orage soudain', hint: 'Coupure de courant incluse.', effect: 'lightning', botLines: ['Un éclair ! Les lumières s’éteignent.', 'L’orage gronde au moment exact de l’aveu.'] },
  { id: 'e-rain', kind: 'evenement', title: 'Il pleut à l’intérieur', hint: 'Personne ne sait pourquoi.', effect: 'rain', botLines: ['Il se met à pleuvoir… à l’intérieur.', 'Une averse tombe. Seulement sur une personne.'] },
  { id: 'e-love', kind: 'evenement', title: 'Coup de foudre', hint: 'Au pire moment possible.', effect: 'hearts', botLines: ['Coup de foudre ! Deux regards se croisent au pire moment.', 'Quelqu’un tombe amoureux. Littéralement, dans l’escalier.'] },
  { id: 'e-boom', kind: 'evenement', title: 'Une explosion', hint: 'Petite. Enfin, moyenne.', effect: 'boom', botLines: ['BOUM ! Une petite explosion. Enfin, moyenne.', 'Quelque chose explose. Heureusement, c’était prévu. Non ?'] },
  { id: 'e-mystery', kind: 'evenement', title: 'Un indice étrange', hint: 'Il ne colle avec rien.', effect: 'question', botLines: ['Un indice apparaît. Il ne correspond à rien. Parfait.', 'Sur le sol, une empreinte de… canard ?'] },
  { id: 'e-nap', kind: 'evenement', title: 'Tout le monde s’endort', hint: 'Pendant exactement 1 minute.', effect: 'zzz', botLines: ['Tout le monde s’endort pile une minute. Au réveil, tout a changé.', 'Une sieste générale. Quelqu’un en a profité.'] },
  { id: 'e-song', kind: 'evenement', title: 'Une comédie musicale', hint: 'Quelqu’un se met à chanter.', effect: 'notes', botLines: ['Quelqu’un se met à chanter. Les autres suivent, gênés.', 'La scène devient une comédie musicale. Personne n’est d’accord.'] },
  { id: 'e-stars', kind: 'evenement', title: 'Pluie d’étoiles', hint: 'Un vœu est autorisé.', effect: 'stars', botLines: ['Une pluie d’étoiles filantes : chacun fait un vœu égoïste.', 'Des étoiles tombent. L’une d’elles a une adresse.'] },

  // Genres
  { id: 'g-polar', kind: 'genre', title: 'Ça vire au polar', hint: 'Imper, ombres et soupçons.', genre: 'polar', botLines: ['L’ambiance vire au polar : tout le monde devient suspect.', 'Une voix off grave raconte la scène. C’est un polar, maintenant.'] },
  { id: 'g-sf', kind: 'genre', title: 'Ça vire à la SF', hint: 'Néons et paradoxes.', genre: 'sf', botLines: ['Tout devient science-fiction : même la chaise a un laser.', 'Un paradoxe temporel s’ouvre. Bonne chance.'] },
  { id: 'g-romance', kind: 'genre', title: 'Ça vire à la romance', hint: 'Violons et regards appuyés.', genre: 'romance', botLines: ['Les violons démarrent. C’est une romance, désormais.', 'Tout le monde rougit sans raison apparente.'] },
  { id: 'g-horreur', kind: 'genre', title: 'Ça vire à l’horreur', hint: 'Légère. Promis.', genre: 'horreur', botLines: ['La lumière vacille. L’horreur (légère) commence.', 'Un grincement. Puis un autre. Puis un rire.'] },
  { id: 'g-aventure', kind: 'genre', title: 'Ça vire à l’aventure', hint: 'Il faut une corde.', genre: 'aventure', botLines: ['Place à l’aventure ! Quelqu’un a une corde ?', 'Le sol s’effondre. C’est un film d’aventure maintenant.'] },
  { id: 'g-western', kind: 'genre', title: 'Ça vire au western', hint: 'Duel à midi.', genre: 'western', botLines: ['Un virevoltant traverse la scène. Western.', 'Duel à midi pile. Il est 11 h 58.'] },
  { id: 'g-comedie', kind: 'genre', title: 'Ça vire à la comédie', hint: 'Une peau de banane suffit.', genre: 'comedie', botLines: ['Quelqu’un glisse sur une peau de banane. C’est une comédie.', 'Rires enregistrés. D’où viennent-ils ?'] },
];
