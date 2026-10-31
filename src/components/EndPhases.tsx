import { useId, useState, type FormEvent } from 'react';
import { getObjective } from '../game/data';
import {
  POINTS_PER_CHAOS_INTEGRATED,
  POINTS_PER_OBJECTIVE,
  POINTS_PER_VOTE,
  computeScores,
  evaluateObjective,
  rankScores,
} from '../game/scoring';
import type { GameState, Player, PlayerId } from '../game/types';
import { StoryStrip } from './StoryStrip';

function ObjectiveReveal({ player }: { player: Player }) {
  const result = evaluateObjective(player);
  return (
    <div className={`objective-reveal${result.achieved ? ' ok' : ' ko'}`}>
      <span className="label">Objectif secret</span>
      <strong>{getObjective(player.objectiveId).title}</strong>
      <span className="small">{getObjective(player.objectiveId).description}</span>
      <span className="objective-result">
        {result.achieved ? '✓ Réussi' : '✗ Raté'} — {result.detail}
      </span>
    </div>
  );
}

export function ReadingPhase({ state, humanId, onContinue }: { state: GameState; humanId: PlayerId; onContinue: () => void }) {
  return (
    <main className="end-phase">
      <h1 className="screen-title">Lecture des BD</h1>
      <p className="muted">Les objectifs secrets sont révélés. Lisez chaque histoire, puis passez au vote.</p>
      {state.players.map((p) => (
        <StoryStrip key={p.id} state={state} player={p} isYou={p.id === humanId} headingLevel="h2" footer={<ObjectiveReveal player={p} />} />
      ))}
      <div className="sticky-cta">
        <button type="button" className="btn btn-primary btn-big" onClick={onContinue}>
          Passer au vote
        </button>
      </div>
    </main>
  );
}

export function VotingPhase({
  state,
  humanId,
  onVote,
}: {
  state: GameState;
  humanId: PlayerId;
  onVote: (targetId: PlayerId) => boolean;
}) {
  const uid = useId();
  const [choice, setChoice] = useState<PlayerId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (sent) return;
    if (!choice) {
      setError('Choisis la BD que tu préfères.');
      return;
    }
    setSent(true);
    if (!onVote(choice)) setSent(false);
  };

  return (
    <main className="end-phase">
      <h1 className="screen-title">Vote</h1>
      <p className="muted">Quelle BD t’a le plus plu ? Tu ne peux pas voter pour la tienne.</p>
      <form onSubmit={submit} noValidate>
        <fieldset className="vote-list">
          <legend className="visually-hidden">BD préférée</legend>
          {state.players.map((p) => {
            const own = p.id === humanId;
            return (
              <div key={p.id} className={`vote-option${choice === p.id ? ' is-selected' : ''}${own ? ' is-own' : ''}`}>
                <label className="vote-label">
                  <input
                    type="radio"
                    name={`${uid}-vote`}
                    value={p.id}
                    disabled={own}
                    checked={choice === p.id}
                    onChange={() => {
                      setChoice(p.id);
                      setError(null);
                    }}
                  />
                  <span>
                    {own ? `Ta BD (vote impossible)` : `Voter pour la BD de ${p.name}`}
                  </span>
                </label>
                <StoryStrip state={state} player={p} isYou={own} />
              </div>
            );
          })}
        </fieldset>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="sticky-cta">
          <button type="submit" className="btn btn-primary btn-big" disabled={sent}>
            {choice ? `Voter pour ${state.players.find((p) => p.id === choice)?.name}` : 'Valider mon vote'}
          </button>
        </div>
      </form>
    </main>
  );
}

export function ResultsPhase({
  state,
  humanId,
  onRestart,
  onQuit,
}: {
  state: GameState;
  humanId: PlayerId;
  onRestart: () => void;
  onQuit: () => void;
}) {
  const ranking = rankScores(computeScores(state));
  const nameOf = (id: PlayerId) => state.players.find((p) => p.id === id)?.name ?? '?';
  const winners = ranking.filter((r) => r.rank === 1);

  return (
    <main className="end-phase">
      <h1 className="screen-title">Résultats</h1>
      <div className="winner-banner" role="status">
        <span className="trophy" aria-hidden="true">
          ★
        </span>
        {winners.length === 1
          ? `${nameOf(winners[0].playerId)} remporte la partie !`
          : `Égalité entre ${winners.map((w) => nameOf(w.playerId)).join(' et ')} !`}
      </div>

      <ol className="ranking">
        {ranking.map((line) => (
          <li key={line.playerId} className={`rank-card${line.playerId === humanId ? ' is-you' : ''}`}>
            <div className="rank-head">
              <span className="rank-num">#{line.rank}</span>
              <strong>{nameOf(line.playerId)}</strong>
              <span className="rank-total">{line.total} pts</span>
            </div>
            <ul className="score-lines">
              <li>
                Votes reçus : {line.votes} × {POINTS_PER_VOTE} = <strong>{line.votePoints}</strong>
              </li>
              <li>
                Objectif « {line.objective.objective.title} » : {line.objective.achieved ? 'réussi' : 'raté'} (
                {line.objective.detail}) = <strong>{line.objectivePoints}</strong>
                {line.objective.achieved ? '' : ` / ${POINTS_PER_OBJECTIVE}`}
              </li>
              <li>
                Contraintes Chaos intégrées : {line.chaosIntegrated} × {POINTS_PER_CHAOS_INTEGRATED} ={' '}
                <strong>{line.chaosPoints}</strong>
              </li>
            </ul>
          </li>
        ))}
      </ol>

      <section className="card-box">
        <h2 className="side-title">Qui a voté pour qui</h2>
        <ul className="vote-recap">
          {state.players.map((p) => (
            <li key={p.id}>
              {p.name} → {nameOf(state.votes[p.id])}
              {p.isBot && <span className="muted small"> (vote de bot automatique)</span>}
            </li>
          ))}
        </ul>
      </section>

      <div className="row-actions center">
        <button type="button" className="btn btn-ghost btn-big" onClick={onQuit}>
          Retour au menu
        </button>
        <button type="button" className="btn btn-primary btn-big" onClick={onRestart}>
          Rejouer
        </button>
      </div>
    </main>
  );
}
