import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { readFirebaseConfig } from '../src/services/firebaseConfig';
import { createRoomService } from '../src/services/roomService';

const notConfigured = createRoomService(readFirebaseConfig({}));

function pressT(times: number) {
  for (let i = 0; i < times; i++) fireEvent.keyDown(window, { key: 't' });
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe('menu principal', () => {
  it('affiche une erreur explicite pour « Créer un salon » sans Firebase', async () => {
    render(<App roomService={notConfigured} />);
    await userEvent.click(screen.getByRole('button', { name: 'Créer un salon' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/Firebase n’est pas configurée/)).toBeInTheDocument();
    expect(within(dialog).getByText(/FIREBASE_NOT_CONFIGURED/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Retour au menu' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('affiche une erreur explicite pour « Rejoindre un salon » sans Firebase', async () => {
    render(<App roomService={notConfigured} />);
    await userEvent.click(screen.getByRole('button', { name: 'Rejoindre un salon' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/multijoueur en ligne n’est pas encore disponible/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('indique honnêtement que le multijoueur n’est pas implémenté si Firebase paraît configurée', async () => {
    const configured = createRoomService(
      readFirebaseConfig({
        VITE_FIREBASE_API_KEY: 'x',
        VITE_FIREBASE_AUTH_DOMAIN: 'x',
        VITE_FIREBASE_PROJECT_ID: 'x',
        VITE_FIREBASE_APP_ID: 'x',
      }),
    );
    render(<App roomService={configured} />);
    await userEvent.click(screen.getByRole('button', { name: 'Créer un salon' }));
    expect(await screen.findByText(/pas encore implémentés/)).toBeInTheDocument();
  });

  it('révèle « Test solo » après 15 pressions sur T, pas après 14', () => {
    render(<App roomService={notConfigured} />);
    pressT(14);
    expect(screen.queryByRole('button', { name: /Test solo/ })).not.toBeInTheDocument();
    pressT(1);
    expect(screen.getByRole('button', { name: /Test solo/ })).toBeInTheDocument();
  });

  it('ignore les T pendant qu’une fenêtre est ouverte sur le menu', async () => {
    render(<App roomService={notConfigured} />);
    await userEvent.click(screen.getByRole('button', { name: 'Comment on joue ?' }));
    pressT(20);
    await userEvent.click(screen.getByRole('button', { name: 'C’est parti' }));
    expect(screen.queryByRole('button', { name: /Test solo/ })).not.toBeInTheDocument();
  });
});

describe('mode test local', () => {
  it('lance une partie sans réseau avec un humain et deux bots', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App roomService={notConfigured} />);
    pressT(15);
    await userEvent.click(screen.getByRole('button', { name: /Test solo/ }));

    // Nom vide refusé.
    await userEvent.click(screen.getByRole('button', { name: 'Lancer la partie' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Indique ton prénom');

    await userEvent.type(screen.getByLabelText('Ton nom'), 'Camille');
    await userEvent.click(screen.getByRole('button', { name: 'Lancer la partie' }));

    expect(screen.getByText('Mode test local')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'À toi, Camille !' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'BD de Bot Bricole' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'BD de Bot Pixel' })).toBeInTheDocument();

    // Validation : carte et légende obligatoires.
    await userEvent.click(screen.getByRole('button', { name: /Valider la case 1/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choisis une carte');

    // Le raccourci T ne fait rien pendant la partie (et n'intercepte pas la saisie).
    const textarea = screen.getByLabelText('2. Écris la légende');
    await userEvent.type(textarea, 'Tout tourne mal');
    expect(textarea).toHaveValue('Tout tourne mal');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('joue un tour humain puis laisse les bots jouer', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App roomService={notConfigured} />);
    pressT(15);
    await user.click(screen.getByRole('button', { name: /Test solo/ }));
    await user.type(screen.getByLabelText('Ton nom'), 'Lou');
    await user.click(screen.getByRole('button', { name: 'Lancer la partie' }));

    const hand = screen.getByRole('group', { name: /carte d’inspiration/ });
    await user.click(within(hand).getAllByRole('radio')[0]);
    await user.type(screen.getByLabelText('2. Écris la légende'), 'Le début de tout.');
    await user.click(screen.getByRole('button', { name: 'Préparer un Chaos (2 en main)' }));
    await user.click(within(screen.getByRole('radiogroup', { name: 'Carte Chaos à jouer' })).getAllByRole('radio')[0]);
    await user.click(screen.getByRole('radio', { name: 'Bot Pixel' }));
    await user.click(screen.getByRole('button', { name: /Valider la case 1/ }));

    expect(screen.getByText(/Bot Bricole/, { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/Contrainte en attente/)).toBeInTheDocument();
    // Chaque bot programme son tour après le rendu du précédent.
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
    }
    expect(await screen.findByRole('heading', { name: 'À toi, Lou !' })).toBeInTheDocument();
    expect(screen.getByText('Le début de tout.', { exact: false })).toBeInTheDocument();
  });
});
