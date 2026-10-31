import { useId, useMemo, useState, type FormEvent } from 'react';
import { getChaos, getFinale, getInspiration, getObjective, getStart } from '../game/data';
import { CAPTION_MAX, chaosTargets, composePanel, finaleForTurn, validateCaption } from '../game/engine';
import type { GameState, Player, TurnInput } from '../game/types';
import { ChaosCardView, FinaleCardView, InspirationCardView } from './Cards';
import { ComicPanel } from './ComicPanel';

interface TurnComposerProps {
  state: GameState;
  player: Player;
  onSubmit: (input: TurnInput) => boolean;
}

export function TurnComposer({ state, player, onSubmit }: TurnComposerProps) {
  const uid = useId();
  const [cardId, setCardId] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [chaosOpen, setChaosOpen] = useState(false);
  const [chaosId, setChaosId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [finaleRevealed, setFinaleRevealed] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const start = getStart(player.startId);
  const panelIndex = player.panels.length;
  const finaleId = finaleForTurn(state, player);
  const pending = player.pendingConstraint;
  const fromName = pending ? state.players.find((p) => p.id === pending.fromPlayerId)?.name : undefined;
  const eligibleTargets = chaosTargets(state, player.id);
  const others = state.players.filter((p) => p.id !== player.id);
  const objective = getObjective(player.objectiveId);

  const previewComposition = useMemo(
    () => (cardId ? composePanel(player, cardId, pending?.cardId, finaleRevealed ? finaleId : undefined) : null),
    [player, cardId, pending, finaleId, finaleRevealed],
  );

  const captionLength = caption.trim().length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    const problems: string[] = [];
    if (!cardId) problems.push('Choisis une carte d’inspiration.');
    if (finaleId && !finaleRevealed) problems.push('Retourne ta carte Finale avant de valider.');
    const captionError = validateCaption(caption);
    if (captionError) problems.push(captionError.message);
    if (chaosOpen && chaosId && !targetId) problems.push('Choisis la personne qui reçoit ta carte Chaos.');
    if (chaosOpen && !chaosId && targetId) problems.push('Choisis quelle carte Chaos jouer.');
    setErrors(problems);
    if (problems.length > 0 || !cardId) return;

    const input: TurnInput = { inspirationId: cardId, caption };
    if (chaosOpen && chaosId && targetId) input.chaos = { cardId: chaosId, targetId };
    setSubmitted(true);
    if (!onSubmit(input)) setSubmitted(false);
  };

  const cancelChaos = () => {
    setChaosOpen(false);
    setChaosId(null);
    setTargetId(null);
  };

  return (
    <form className="composer" onSubmit={submit} noValidate aria-labelledby={`${uid}-title`}>
      <header className="composer-head">
        <p className="eyebrow">
          Case {panelIndex + 1} / {state.panelsPerStory}
          {finaleId ? ' · dernière case' : ''}
        </p>
        <h2 id={`${uid}-title`}>À toi, {player.name} !</h2>
        <p className="muted">
          Ton histoire : <strong>{start.place}</strong>, mais {start.problem}
        </p>
      </header>

      {pending && (
        <div className="constraint-banner" role="status">
          <span className="banner-label">Contrainte Chaos reçue{fromName ? ` de ${fromName}` : ''}</span>
          <strong>{getChaos(pending.cardId).constraint}</strong>
          <span className="small">Intègre-la dans cette case, à ta façon. Elle sera ajoutée au dessin.</span>
        </div>
      )}

      {finaleId && (
        <div className="finale-zone">
          {finaleRevealed ? (
            <>
              <FinaleCardView card={getFinale(finaleId)} />
              <p className="small">La Finale donne la forme de ta conclusion, à toi d’écrire laquelle.</p>
            </>
          ) : (
            <button type="button" className="finale-back" onClick={() => setFinaleRevealed(true)}>
              <span className="finale-back-pattern" aria-hidden="true" />
              <span>
                <strong>Ta carte Finale</strong>
                <br />
                Retourner la carte
              </span>
            </button>
          )}
        </div>
      )}

      <fieldset className="hand">
        <legend>1. Choisis une carte d’inspiration</legend>
        <div className="card-grid">
          {player.hand.map((id) => (
            <InspirationCardView
              key={id}
              card={getInspiration(id)}
              name={`${uid}-hand`}
              checked={cardId === id}
              onSelect={() => setCardId(id)}
            />
          ))}
        </div>
      </fieldset>

      <div className="caption-zone">
        <label htmlFor={`${uid}-caption`} className="legend-like">
          2. Écris la légende
        </label>
        <textarea
          id={`${uid}-caption`}
          className="input textarea"
          rows={3}
          maxLength={CAPTION_MAX}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={cardId ? getInspiration(cardId).hint : 'Que se passe-t-il dans cette case ?'}
          aria-describedby={`${uid}-count`}
          disabled={Boolean(finaleId) && !finaleRevealed}
        />
        <p id={`${uid}-count`} className={`counter${captionLength > CAPTION_MAX - 20 ? ' warn' : ''}`}>
          {caption.length} / {CAPTION_MAX}
        </p>
      </div>

      {previewComposition && (
        <div className="preview">
          <p className="label">Aperçu de ta case</p>
          <ComicPanel
            index={panelIndex}
            total={state.panelsPerStory}
            preview={{
              composition: previewComposition,
              caption: caption.trim(),
              constraintId: pending?.cardId,
              finaleId: finaleRevealed ? finaleId : undefined,
            }}
          />
        </div>
      )}

      <fieldset className="chaos-zone">
        <legend>3. Carte Chaos (facultatif)</legend>
        {player.chaosHand.length === 0 ? (
          <p className="muted small">Tu as déjà joué toutes tes cartes Chaos.</p>
        ) : eligibleTargets.length === 0 ? (
          <p className="muted small">Personne ne peut recevoir de contrainte pour l’instant.</p>
        ) : !chaosOpen ? (
          <button type="button" className="btn btn-chaos" onClick={() => setChaosOpen(true)}>
            Préparer un Chaos ({player.chaosHand.length} en main)
          </button>
        ) : (
          <div className="stack">
            <div className="card-grid chaos-grid" role="radiogroup" aria-label="Carte Chaos à jouer">
              {player.chaosHand.map((id, i) => (
                <ChaosCardView
                  key={`${id}-${i}`}
                  card={getChaos(id)}
                  name={`${uid}-chaos`}
                  checked={chaosId === id}
                  onSelect={() => setChaosId(id)}
                />
              ))}
            </div>
            <div className="targets" role="radiogroup" aria-label="Cible">
              <p className="label">Cible</p>
              {others.map((p) => {
                const eligible = eligibleTargets.some((t) => t.id === p.id);
                const reason = p.pendingConstraint
                  ? 'a déjà une contrainte'
                  : p.panels.length >= state.panelsPerStory
                    ? 'BD terminée'
                    : '';
                return (
                  <label key={p.id} className={`target${targetId === p.id ? ' is-selected' : ''}${eligible ? '' : ' is-disabled'}`}>
                    <input
                      type="radio"
                      name={`${uid}-target`}
                      value={p.id}
                      checked={targetId === p.id}
                      disabled={!eligible}
                      onChange={() => setTargetId(p.id)}
                    />
                    <span>{p.name}</span>
                    {!eligible && <span className="muted small"> — {reason}</span>}
                  </label>
                );
              })}
            </div>
            <button type="button" className="btn btn-ghost" onClick={cancelChaos}>
              Ne pas jouer de Chaos
            </button>
          </div>
        )}
      </fieldset>

      {errors.length > 0 && (
        <div className="form-errors" role="alert">
          {errors.map((err) => (
            <p key={err}>{err}</p>
          ))}
        </div>
      )}

      <div className="composer-foot">
        <p className="objective-mini">
          <span className="label">Ton objectif secret</span>
          <strong>{objective.title}</strong> — {objective.description}
        </p>
        <button type="submit" className="btn btn-primary btn-big" disabled={submitted}>
          Valider la case {panelIndex + 1}
        </button>
      </div>
    </form>
  );
}
