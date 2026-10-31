import { useState, type FormEvent } from 'react';
import { CHARACTER_SPRITES } from '../art/characters';
import { PixelIcon } from '../art/pixel';
import { PixelTitle } from '../art/PixelTitle';
import { useSecretUnlock } from '../hooks/useSecretUnlock';
import type { RoomError, RoomService } from '../services/roomService';
import { Modal } from './Modal';
import { RulesModal } from './RulesModal';

interface MainMenuProps {
  roomService: RoomService;
  testUnlocked: boolean;
  onUnlockTest: () => void;
  onOpenTest: () => void;
}

type Dialog = { kind: 'none' } | { kind: 'rules' } | { kind: 'join' } | { kind: 'error'; error: RoomError };

const PARADE = ['detective', 'robot', 'grandma', 'alien', 'chef', 'ghost', 'pirate', 'cat'] as const;

export function MainMenu({ roomService, testUnlocked, onUnlockTest, onOpenTest }: MainMenuProps) {
  const [dialog, setDialog] = useState<Dialog>({ kind: 'none' });
  const [busy, setBusy] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  // Le raccourci n'écoute que sur le menu, et pas quand une fenêtre est ouverte.
  const onLogoTap = useSecretUnlock(!testUnlocked && dialog.kind === 'none', onUnlockTest);

  const createRoom = async () => {
    setBusy(true);
    const result = await roomService.createRoom('Hôte');
    setBusy(false);
    if (!result.ok) setDialog({ kind: 'error', error: result.error });
  };

  const openJoin = () => {
    const availability = roomService.checkAvailability();
    if (!availability.ok) setDialog({ kind: 'error', error: availability.error });
    else setDialog({ kind: 'join' });
  };

  const submitJoin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result = await roomService.joinRoom(roomCode, 'Joueur');
    setBusy(false);
    if (!result.ok) setDialog({ kind: 'error', error: result.error });
  };

  const close = () => setDialog({ kind: 'none' });

  return (
    <main className="menu" aria-labelledby="menu-title">
      <div className="menu-hero">
        {/* Le logo sert aussi de déverrouillage tactile discret (15 appuis). */}
        <div className="logo" onClick={onLogoTap} data-testid="logo">
          <h1 id="menu-title" className="visually-hidden">
            La Case suivante
          </h1>
          <PixelTitle lines={['LA CASE', 'SUIVANTE']} />
        </div>
        <p className="tagline">
          Chacun dessine sa mini-BD, case après case.
          <br />
          Les autres la font dérailler.
        </p>
        <div className="parade" aria-hidden="true">
          {PARADE.map((key, i) => (
            <span key={key} className="parade-item" style={{ animationDelay: `${i * 120}ms` }}>
              <PixelIcon rows={CHARACTER_SPRITES[key].rows} palette={CHARACTER_SPRITES[key].palette} size={44} />
            </span>
          ))}
        </div>
      </div>

      <div className="menu-actions">
        <button type="button" className="btn btn-primary btn-big" onClick={createRoom} disabled={busy}>
          Créer un salon
        </button>
        <button type="button" className="btn btn-secondary btn-big" onClick={openJoin} disabled={busy}>
          Rejoindre un salon
        </button>
        {testUnlocked && (
          <button type="button" className="btn btn-test btn-big" onClick={onOpenTest}>
            <span className="test-chip" aria-hidden="true">
              TEST
            </span>
            Test solo (local)
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => setDialog({ kind: 'rules' })}>
          Comment on joue ?
        </button>
      </div>

      <p className="menu-foot muted">3 à 6 joueurs · 4 cases chacun · ≈ 20 minutes</p>

      {dialog.kind === 'rules' && <RulesModal onClose={close} />}

      {dialog.kind === 'join' && (
        <Modal title="Rejoindre un salon" onClose={close}>
          <form onSubmit={submitJoin} className="stack">
            <label htmlFor="room-code">Code du salon</label>
            <input
              id="room-code"
              className="input"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoComplete="off"
              inputMode="text"
            />
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Rejoindre
            </button>
          </form>
        </Modal>
      )}

      {dialog.kind === 'error' && (
        <Modal
          title={dialog.error.title}
          tone="error"
          onClose={close}
          actions={
            <>
              {testUnlocked && (
                <button
                  type="button"
                  className="btn btn-test"
                  onClick={() => {
                    close();
                    onOpenTest();
                  }}
                >
                  Lancer le test solo
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={close}>
                Retour au menu
              </button>
            </>
          }
        >
          <p data-error-code={dialog.error.code}>{dialog.error.message}</p>
          <p className="muted small">Code : {dialog.error.code}</p>
        </Modal>
      )}
    </main>
  );
}
