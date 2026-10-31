import { useState, type FormEvent } from 'react';
import { CHARACTER_SPRITES } from '../art/characters';
import { PixelIcon } from '../art/pixel';
import { BOT_NAMES } from '../game/session';

const NAME_MAX = 16;

export function SoloSetup({ onStart, onBack }: { onStart: (name: string) => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Indique ton prénom ou un pseudo.');
      return;
    }
    if (BOT_NAMES.includes(trimmed)) {
      setError('Ce nom est déjà pris par un bot.');
      return;
    }
    onStart(trimmed);
  };

  return (
    <main className="setup">
      <div className="test-banner" role="note">
        Mode test local — partie simulée sur cet appareil, sans réseau.
      </div>
      <h1 className="screen-title">Préparer le test solo</h1>
      <p className="muted">Une vraie partie complète contre deux bots locaux aux réactions prévisibles.</p>

      <form className="card-box stack" onSubmit={submit} noValidate>
        <label htmlFor="player-name">Ton nom</label>
        <input
          id="player-name"
          className="input"
          value={name}
          maxLength={NAME_MAX}
          autoComplete="nickname"
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'player-name-error' : undefined}
          placeholder="Ex. Camille"
        />
        {error && (
          <p id="player-name-error" className="field-error" role="alert">
            {error}
          </p>
        )}

        <div className="setup-players">
          <p className="label">Autour de la table</p>
          <ul className="seat-list">
            <li className="seat seat-you">
              <PixelIcon rows={CHARACTER_SPRITES.kid.rows} palette={CHARACTER_SPRITES.kid.palette} size={36} />
              <span>{name.trim() || 'Toi'}</span>
              <span className="tag">humain</span>
            </li>
            {BOT_NAMES.map((bot, i) => {
              const sprite = CHARACTER_SPRITES[i === 0 ? 'robot' : 'alien'];
              return (
                <li key={bot} className="seat">
                  <PixelIcon rows={sprite.rows} palette={sprite.palette} size={36} />
                  <span>{bot}</span>
                  <span className="tag tag-bot">bot local</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Retour
          </button>
          <button type="submit" className="btn btn-primary btn-big">
            Lancer la partie
          </button>
        </div>
      </form>
    </main>
  );
}
