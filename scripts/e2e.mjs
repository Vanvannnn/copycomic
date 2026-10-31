// Parcours complet dans un vrai navigateur (Chromium via Playwright), sur téléphone et ordinateur.
// Usage : npm run build && npx vite preview --port 4173 &  puis  npm run e2e
// Variables : E2E_URL (défaut http://localhost:4173), E2E_OUT (captures, défaut e2e-output).

import { mkdir } from 'node:fs/promises';
import { chromium, devices } from 'playwright';

const URL = process.env.E2E_URL ?? 'http://localhost:4173';
const OUT = process.env.E2E_OUT ?? 'e2e-output';
const results = [];

function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function noHorizontalOverflow(page) {
  // clientWidth et non innerWidth : en émulation mobile, innerWidth s'élargit avec le contenu.
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

async function run(label, contextOptions, { useTouchUnlock = false } = {}) {
  console.log(`\n=== ${label} ===`);
  const browser = await chromium.launch();
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const shot = (name) => page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: false });
  const external = [];
  page.on('request', (req) => {
    if (!req.url().startsWith(URL)) external.push(req.url());
  });
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Créer un salon' }).waitFor();
  check(`${label}: menu sans débordement horizontal`, await noHorizontalOverflow(page));
  const createBox = await page.getByRole('button', { name: 'Créer un salon' }).boundingBox();
  check(`${label}: bouton principal ≥ 44 px`, createBox && createBox.height >= 44, `${createBox?.height}px`);
  await shot('01-menu');

  // Erreurs Firebase
  await page.getByRole('button', { name: 'Créer un salon' }).click();
  const dialog = page.getByRole('alertdialog');
  await dialog.waitFor();
  check(`${label}: « Créer » → FIREBASE_NOT_CONFIGURED`, (await dialog.textContent()).includes('FIREBASE_NOT_CONFIGURED'));
  await shot('02-firebase-error');
  await dialog.getByRole('button', { name: 'Retour au menu' }).click();
  await page.getByRole('button', { name: 'Rejoindre un salon' }).click();
  await dialog.waitFor();
  check(`${label}: « Rejoindre » → erreur explicite`, (await dialog.textContent()).includes('Firebase n’est pas configurée'));
  await page.keyboard.press('Escape');
  check(`${label}: modal fermée par Échap`, (await dialog.count()) === 0);

  // Déverrouillage caché
  const testButton = page.getByRole('button', { name: /Test solo/ });
  if (useTouchUnlock) {
    for (let i = 0; i < 14; i++) await page.getByTestId('logo').tap();
    check(`${label}: 14 appuis sur le logo ne déverrouillent pas`, (await testButton.count()) === 0);
    await page.getByTestId('logo').tap();
  } else {
    for (let i = 0; i < 13; i++) await page.keyboard.press('t');
    // Une touche maintenue (répétition automatique) ne compte qu'une fois : 14 vraies pressions.
    await page.keyboard.down('t');
    for (let i = 0; i < 5; i++) await page.keyboard.down('t');
    await page.keyboard.up('t');
    check(`${label}: 14 pressions (dont une maintenue) ne déverrouillent pas`, (await testButton.count()) === 0);
    await page.keyboard.press('t');
  }
  await testButton.waitFor({ timeout: 3000 });
  check(`${label}: 15 pressions déverrouillent « Test solo »`, (await testButton.count()) === 1);
  await shot('03-unlocked');

  // À partir d'ici, plus aucun réseau.
  await context.setOffline(true);
  await testButton.click();
  await page.getByLabel('Ton nom').fill('Camille');
  await shot('04-setup');
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByText('Mode test local').waitFor();
  check(`${label}: partie locale lancée hors-ligne`, true);

  let chaosPlayed = false;
  let constraintSeen = false;
  let finaleSeen = false;
  let overflowOk = true;
  for (let guard = 0; guard < 40; guard++) {
    const phase = await page.locator('.game-status').textContent();
    if (!phase.startsWith('Création')) break;
    const composer = page.locator('form.composer');
    if ((await composer.count()) === 0) {
      await page.waitForTimeout(400);
      continue;
    }
    const caseLabel = await composer.locator('.eyebrow').textContent();
    const n = Number(caseLabel.match(/Case (\d)/)[1]);
    overflowOk &&= await noHorizontalOverflow(page);
    if (n === 1) await shot('05-turn1');

    if (await composer.locator('.constraint-banner').count()) {
      constraintSeen = true;
      await shot(`06-constraint-case${n}`);
    }
    const finaleBack = composer.getByRole('button', { name: /Retourner la carte/ });
    if (await finaleBack.count()) {
      // Valider avant de retourner la Finale doit échouer.
      await composer.locator('.game-card').first().click();
      check(`${label}: légende bloquée tant que la Finale est cachée`, await composer.getByLabel('2. Écris la légende').isDisabled());
      await finaleBack.click();
      finaleSeen = (await composer.locator('.finale-card').count()) === 1;
    }
    await composer.locator('.card-grid .game-card').first().click();
    // Légende vide refusée
    await composer.getByRole('button', { name: /Valider la case/ }).click();
    if (n === 1) check(`${label}: légende vide refusée`, (await composer.locator('.form-errors').count()) === 1);
    await composer.getByLabel('2. Écris la légende').fill(`Case ${n} de Camille : rien ne se passe comme prévu.`);
    if (!chaosPlayed) {
      await composer.getByRole('button', { name: /Préparer un Chaos/ }).click();
      await composer.locator('.chaos-card').first().click();
      await composer.locator('.target:not(.is-disabled)').first().click();
      chaosPlayed = true;
      await shot('07-chaos');
    }
    if (finaleSeen && n === 4) await shot('08-finale');
    await composer.getByRole('button', { name: /Valider la case/ }).click();
    await page.waitForTimeout(300);
  }
  check(`${label}: carte Chaos jouée par le joueur`, chaosPlayed);
  check(`${label}: contrainte reçue et affichée au bon tour`, constraintSeen);
  check(`${label}: carte Finale révélée à la dernière case`, finaleSeen);
  check(`${label}: pas de débordement horizontal pendant la partie`, overflowOk);

  await page.getByRole('heading', { name: 'Lecture des BD' }).waitFor();
  check(`${label}: objectifs révélés`, (await page.locator('.objective-reveal').count()) === 3);
  check(`${label}: 12 cases dessinées`, (await page.locator('.comic-panel:not(.empty)').count()) === 12);
  check(`${label}: lecture sans débordement`, await noHorizontalOverflow(page));
  await shot('09-reading');
  await page.screenshot({ path: `${OUT}/${label}-09-reading-full.png`, fullPage: true });

  // Persistance : rafraîchir ne perd pas la partie.
  await context.setOffline(false);
  await page.reload();
  await page.getByRole('heading', { name: 'Lecture des BD' }).waitFor();
  check(`${label}: partie restaurée après rafraîchissement`, true);
  await context.setOffline(true);

  await page.getByRole('button', { name: 'Passer au vote' }).click();
  const own = page.locator('.vote-option.is-own input');
  check(`${label}: impossible de voter pour soi`, await own.isDisabled());
  await page.locator('.vote-option:not(.is-own) .vote-label').first().click();
  await shot('10-vote');
  await page.getByRole('button', { name: /^Voter pour/ }).click();
  await page.getByRole('heading', { name: 'Résultats' }).waitFor();
  check(`${label}: résultats affichés`, (await page.locator('.rank-card').count()) === 3);
  check(`${label}: résultats sans débordement`, await noHorizontalOverflow(page));
  await shot('11-results');
  await page.screenshot({ path: `${OUT}/${label}-11-results-full.png`, fullPage: true });

  await page.getByRole('button', { name: 'Rejouer' }).click();
  await page.getByRole('heading', { name: 'À toi, Camille !' }).waitFor();
  check(`${label}: « Rejouer » relance une partie`, true);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Menu (efface la partie)' }).click();
  await page.getByRole('button', { name: 'Créer un salon' }).waitFor();
  check(`${label}: retour au menu`, (await page.evaluate(() => Object.keys(localStorage).length)) === 0, 'sauvegarde effacée');

  check(`${label}: aucune requête externe`, external.length === 0, external.join(', '));
  check(`${label}: aucune erreur JavaScript`, pageErrors.length === 0, pageErrors.join(' | '));
  await browser.close();
}

await mkdir(OUT, { recursive: true });
const { defaultBrowserType: _ignored, ...iphone } = devices['iPhone 13'];
await run('mobile', iphone, { useTouchUnlock: true });
await run('mobile-clavier', { viewport: { width: 360, height: 740 } });
await run('desktop', { viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies.`);
process.exit(failed.length ? 1 : 0);
