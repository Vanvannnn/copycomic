import { useEffect, useState } from 'react';
import { currentPlayer } from '../game/engine';
import { HUMAN_ID } from '../game/session';
import type { GameState, PlayerId, TurnInput } from '../game/types';
import { ReadingPhase, ResultsPhase, VotingPhase } from './EndPhases';
import { Modal } from './Modal';
import { StoryStrip } from './StoryStrip';
import { TurnComposer } from './TurnComposer';

interface GameScreenProps {
  state: GameState;
  onHumanTurn: (input: TurnInput) => boolean;
  onBotTurn: (botId: PlayerId) => void;
  onStartVoting: () => void;
  onVote: (targetId: PlayerId) => boolean;
  onRestart: () => void;
  onQuit: () => void;
}

function botDelay(): number {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return reduced ? 400 : 1300;
}

const PHASE_LABEL: Record<GameState['phase'], string> = {
  playing: 'Création',
  reading: 'Lecture',
  voting: 'Vote',
  results: 'Résultats',
};

export function GameScreen({ state, onHumanTurn, onBotTurn, onStartVoting, onVote, onRestart, onQuit }: GameScreenProps) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const active = currentPlayer(state);
  const human = state.players.find((p) => p.id === HUMAN_ID) ?? state.players[0];
  const botTurnId = state.phase === 'playing' && active.isBot && !pauseOpen ? active.id : null;

  // Les bots jouent seuls après un court délai (pas d'appel réseau, pas d'IA).
  useEffect(() => {
    if (!botTurnId) return;
    const timer = window.setTimeout(() => onBotTurn(botTurnId), botDelay());
    return () => window.clearTimeout(timer);
  }, [botTurnId, state.round, onBotTurn]);

  // Les autres BD : celle du joueur humain en premier.
  const ordered = [human, ...state.players.filter((p) => p.id !== human.id)];
  const recentLog = state.log.slice(-5).reverse();

  return (
    <div className="game">
      <header className="game-bar">
        <span className="test-badge" title="Partie simulée sur cet appareil, aucune connexion en ligne">
          Mode test local
        </span>
        <span className="game-status">
          {PHASE_LABEL[state.phase]}
          {state.phase === 'playing' && ` · manche ${state.round}/${state.panelsPerStory}`}
        </span>
        <button type="button" className="btn btn-small" onClick={() => setPauseOpen(true)}>
          Pause
        </button>
      </header>

      {state.phase === 'playing' && (
        <div className="game-layout">
          <div className="game-main">
            {active.isBot ? (
              <div className="waiting card-box" role="status" aria-live="polite">
                <span className="pencil" aria-hidden="true" />
                <p>
                  <strong>{active.name}</strong> dessine sa case {active.panels.length + 1}…
                </p>
                <p className="muted small">Les bots sont locaux et jouent avec des phrases prédéfinies.</p>
              </div>
            ) : (
              <TurnComposer key={`${state.round}-${state.turnIndex}`} state={state} player={active} onSubmit={onHumanTurn} />
            )}
          </div>
          <aside className="game-side" aria-label="Journal de partie">
            <h2 className="side-title">Journal</h2>
            <ol className="log">
              {recentLog.map((entry) => (
                <li key={entry.id} className={`log-${entry.tone}`}>
                  {entry.text}
                </li>
              ))}
            </ol>
          </aside>
          <section className="stories" aria-label="Les BD en cours">
            <h2 className="section-title">Les BD en cours</h2>
            {ordered.map((p) => (
              <StoryStrip key={p.id} state={state} player={p} isActive={p.id === active.id} isYou={p.id === human.id} />
            ))}
          </section>
        </div>
      )}

      {state.phase === 'reading' && <ReadingPhase state={state} humanId={human.id} onContinue={onStartVoting} />}
      {state.phase === 'voting' && <VotingPhase state={state} humanId={human.id} onVote={onVote} />}
      {state.phase === 'results' && (
        <ResultsPhase state={state} humanId={human.id} onRestart={onRestart} onQuit={onQuit} />
      )}

      {pauseOpen && (
        <Modal
          title="Pause"
          onClose={() => setPauseOpen(false)}
          actions={
            <>
              <button type="button" className="btn btn-ghost" onClick={onQuit}>
                Menu (efface la partie)
              </button>
              <button type="button" className="btn btn-secondary" onClick={onRestart}>
                Recommencer
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setPauseOpen(false)}>
                Continuer
              </button>
            </>
          }
        >
          <p>La partie est sauvegardée sur cet appareil : tu peux rafraîchir la page sans la perdre.</p>
          <p className="muted small">
            « Recommencer » lance une nouvelle partie et « Menu » efface la sauvegarde locale.
          </p>
        </Modal>
      )}
    </div>
  );
}
