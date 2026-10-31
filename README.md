# La Case suivante

Prototype web d’un jeu de soirée de narration illustrée : chaque joueur crée sa mini-BD de 4 cases en pixel art, et les autres la font dérailler avec des cartes Chaos. Responsive téléphone / ordinateur, React + TypeScript + Vite, sans dépendance réseau à l’exécution.

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:5173
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | vérification TypeScript + build de production dans `dist/` |
| `npm run preview` | sert le build (`dist/`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript seul |
| `npm test` | tests unitaires et composants (Vitest + Testing Library) |
| `npm run e2e` | parcours complet dans Chromium (voir plus bas) |

## Mode test solo (caché)

Permet de jouer une vraie partie complète **sans Firebase, sans réseau et sans autre joueur**.

- **Clavier :** sur le menu principal, appuyer **15 fois sur `T`**. Le bouton « Test solo (local) » apparaît.
  - Les répétitions automatiques d’une touche maintenue (`KeyboardEvent.repeat`) ne comptent pas.
  - Les `T` tapés dans un champ de texte, avec Ctrl/Cmd/Alt, ou pendant qu’une fenêtre est ouverte ne comptent pas.
  - Le compteur se remet à zéro après **2 secondes** sans pression.
  - L’écoute n’existe que sur le menu principal, jamais pendant une partie.
- **Tactile :** **15 appuis sur le logo** « La Case suivante » (même délai de 2 s).

Ensuite : saisir son nom → « Lancer la partie ». La partie oppose **1 humain à 2 bots locaux** (« Bot Bricole » et « Bot Pixel »). Un badge **« Mode test local »** reste affiché.

- Les bots utilisent uniquement des phrases prédéfinies et des règles déterministes (aucune IA, aucune API). Ils choisissent la carte qui sert leur objectif secret, jouent leurs cartes Chaos aux manches 1 et 3 (1 et 2 si leur objectif est « Semeur de chaos ») en ciblant l’humain en priorité, et votent pour la BD qui a intégré le plus de contraintes.
- La partie est **sauvegardée dans le `localStorage`** : rafraîchir la page la restaure. « Pause → Recommencer » lance une nouvelle partie, « Pause → Menu » ou « Retour au menu » efface la sauvegarde.

## Règles implémentées

1. 3 à 6 joueurs (le mode test en a 3). Chacun reçoit un **départ différent** (lieu + problème) et un **objectif secret**.
2. Les joueurs jouent à tour de rôle ; une manche = une case par joueur ; **4 manches**.
3. À son tour, on **choisit une carte d’inspiration** (Personnage, Objet, Lieu, Événement ou Genre) parmi 4 en main et on **écrit une légende** (1 à 180 caractères). La case se dessine automatiquement à partir de la carte : décor, personnages, objet, effet, teinte de genre. La carte jouée est remplacée par une pioche.
4. **Chaos (facultatif) :** chaque joueur a 2 cartes Chaos. On peut en jouer une, pendant son tour, contre un autre joueur. La contrainte s’applique à **la prochaine case de la cible** : elle est affichée sur son écran, ajoute un élément visuel (témoin, masque, tribunal…) et un tampon « Chaos » sur la case. Elle ne modifie ni ne supprime jamais une case existante.
   - Choix pour le MVP : une seule contrainte en attente par joueur ; on ne peut pas cibler quelqu’un dont la BD est terminée.
5. **Finale :** à la 4e case, le joueur retourne une carte Finale (révélation, écho à la première case…) qui donne la forme de la conclusion. Elle n’apparaît jamais avant.
6. **Fin :** les objectifs secrets sont révélés, on lit les BD, puis chacun vote pour une BD (jamais la sienne). Les bots votent automatiquement après l’humain.
7. **Score :** 3 points par vote reçu, 2 points si l’objectif secret est réussi, 1 point par contrainte Chaos intégrée. Égalité parfaite (total et votes) = rang partagé.

Les objectifs secrets ne vérifient que des données du jeu, jamais le sens des légendes : nombre de genres, changements de lieu, personnages distincts, cartes Objet/Événement jouées, cartes Chaos jouées, même lieu au début et à la fin, objet répété, longueur de légende.

Toutes les données (départs, cartes, Chaos, Finales, objectifs) sont dans [src/game/data/](src/game/data/) et s’étendent en ajoutant des entrées.

## Firebase et multijoueur en ligne

Le multijoueur en ligne **n’est pas implémenté**. La couche [src/services/roomService.ts](src/services/roomService.ts) isole le jeu de la future implémentation et ne simule jamais de succès :

| Situation | Code d’erreur | Ce que voit le joueur |
| --- | --- | --- |
| Variables Firebase absentes ou vides | `FIREBASE_NOT_CONFIGURED` | fenêtre d’erreur : le multijoueur en ligne n’est pas disponible car Firebase n’est pas configurée ; le mode test local reste disponible |
| Variables présentes | `MULTIPLAYER_NOT_IMPLEMENTED` | fenêtre d’erreur : configuration détectée, mais salons pas encore implémentés ; aucun salon créé ni rejoint |

Variables attendues (voir [.env.example](.env.example), à copier en `.env.local`) : `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` (obligatoires pour la détection), `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`. Aucun SDK Firebase n’est installé.

Pour brancher Firebase plus tard : implémenter l’interface `RoomService` (`checkAvailability`, `createRoom`, `joinRoom`) et synchroniser `GameState` — le moteur de règles est déjà pur et sérialisable.

## Architecture

```
src/
  game/          règles pures, sans React
    types.ts       types : joueurs, cartes, cases, contraintes, objectifs, votes, état
    data/          départs, cartes d’inspiration, Chaos, Finales, objectifs
    engine.ts      création de partie, tours, Chaos, Finale, vote (actions pures → état ou erreur typée)
    scoring.ts     objectifs secrets et scores
    bots.ts        décisions des bots locaux
    rng.ts         aléatoire déterministe (graine sauvegardée)
    session.ts     partie test : 1 humain + 2 bots
    storage.ts     sauvegarde localStorage
  services/      détection de config Firebase + RoomService
  hooks/         déverrouillage caché (logique pure + hook React)
  art/           sprites pixel art générés en SVG (personnages, objets, effets, décors, titre)
  components/    écrans et composants d’interface
tests/           tests Vitest
scripts/e2e.mjs  parcours navigateur Playwright
```

Les visuels sont entièrement locaux : grilles de caractères converties en `<rect>` SVG avec `shape-rendering="crispEdges"`, aucune image ni police externe.

## Tests

- `npm test` : déverrouillage `T` (15 / 14 pressions, répétition, champ de texte, désactivation, appuis logo, délai), progression des tours, validations, Chaos (bonne cible, bonne case, cibles interdites), Finale uniquement à la dernière case, votes (pas pour soi, pas deux fois), objectifs et scores, bots sur 60 graines, erreurs Firebase, parcours d’interface du menu et du mode test.
- `npm run e2e` : nécessite un build servi et Chromium pour Playwright.

  ```bash
  npm run build
  npx vite preview --port 4173 &
  npx playwright install chromium   # une seule fois si besoin
  npm run e2e                        # captures dans e2e-output/
  ```

  Le script joue une partie complète sur iPhone 13 (déverrouillage tactile), sur un écran 360 px (clavier) et sur ordinateur 1366 px (animations réduites), réseau coupé après le chargement, et vérifie notamment l’absence de débordement horizontal et de requête externe.

## Limites connues

- Pas de multijoueur en ligne ni de jeu à plusieurs humains sur le même appareil : seul le mode test local est jouable.
- Les bots sont volontairement simples : leurs légendes sont des phrases prédéfinies et ils ciblent l’humain en priorité avec leurs cartes Chaos, pour tester ce cas souvent.
- L’intégration d’une contrainte dans la légende n’est pas vérifiée (impossible sans interpréter le texte) : la contrainte est attachée à la case et ajoute un élément visuel.
- `npm audit` signale des vulnérabilités modérées dans des dépendances de développement (chaîne ESLint) ; elles n’entrent pas dans le build.
