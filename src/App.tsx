import { useCallback, useEffect, useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { MainMenu } from './components/MainMenu';
import { SoloSetup } from './components/SoloSetup';
import { ToastArea, type ToastMessage } from './components/Toast';
import { decideBotTurn, decideBotVote } from './game/bots';
import { getChaos } from './game/data';
import { castVote, startVoting, submitTurn } from './game/engine';
import { HUMAN_ID, createSoloGame } from './game/session';
import { clearSavedGame, loadGame, saveGame } from './game/storage';
import type { GameResult, GameState, PlayerId, TurnInput } from './game/types';
import { roomService as defaultRoomService, type RoomService } from './services/roomService';

type Screen = 'menu' | 'setup' | 'game';

function newSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) | 0;
}

export default function App({ roomService = defaultRoomService }: { roomService?: RoomService }) {
  const [game, setGame] = useState<GameState | null>(() => loadGame());
  const [screen, setScreen] = useState<Screen>(() => (game ? 'game' : 'menu'));
  const [testUnlocked, setTestUnlocked] = useState(() => game !== null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    setToasts((list) => [...list.slice(-2), { id: Date.now() + Math.random(), text, tone }]);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  useEffect(() => {
    if (game) saveGame(game);
  }, [game]);

  /** Applique le résultat d'une action et signale les nouveautés au joueur humain. */
  const apply = useCallback(
    (before: GameState, result: GameResult): boolean => {
      if (!result.ok) {
        notify(result.message, 'error');
        return false;
      }
      const humanBefore = before.players.find((p) => p.id === HUMAN_ID);
      const humanAfter = result.state.players.find((p) => p.id === HUMAN_ID);
      if (humanAfter?.pendingConstraint && !humanBefore?.pendingConstraint) {
        const from = result.state.players.find((p) => p.id === humanAfter.pendingConstraint?.fromPlayerId);
        notify(`${from?.name ?? 'Quelqu’un'} t’impose « ${getChaos(humanAfter.pendingConstraint.cardId).title} » !`, 'chaos');
      }
      setGame(result.state);
      return true;
    },
    [notify],
  );

  const onUnlockTest = useCallback(() => {
    setTestUnlocked(true);
    notify('Mode test solo déverrouillé.', 'success');
  }, [notify]);

  const startSolo = (name: string) => {
    clearSavedGame();
    setGame(createSoloGame(name, newSeed()));
    setScreen('game');
  };

  const restart = () => {
    const name = game?.players.find((p) => p.id === HUMAN_ID)?.name ?? 'Toi';
    startSolo(name);
  };

  const quit = () => {
    clearSavedGame();
    setGame(null);
    setScreen('menu');
  };

  const onHumanTurn = (input: TurnInput) => (game ? apply(game, submitTurn(game, HUMAN_ID, input)) : false);

  const onBotTurn = useCallback(
    (botId: PlayerId) => {
      if (!game) return;
      apply(game, submitTurn(game, botId, decideBotTurn(game, botId)));
    },
    [game, apply],
  );

  const onStartVoting = () => {
    if (game) apply(game, startVoting(game));
  };

  const onVote = (targetId: PlayerId): boolean => {
    if (!game) return false;
    const first = castVote(game, HUMAN_ID, targetId);
    if (!first.ok) return apply(game, first);
    // Les bots votent juste après l'humain, de façon déterministe.
    let state = first.state;
    for (const bot of state.players.filter((p) => p.isBot)) {
      const result = castVote(state, bot.id, decideBotVote(state, bot.id));
      if (result.ok) state = result.state;
    }
    return apply(game, { ok: true, state });
  };

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          roomService={roomService}
          testUnlocked={testUnlocked}
          onUnlockTest={onUnlockTest}
          onOpenTest={() => setScreen('setup')}
        />
      )}
      {screen === 'setup' && <SoloSetup onStart={startSolo} onBack={() => setScreen('menu')} />}
      {screen === 'game' && game && (
        <GameScreen
          state={game}
          onHumanTurn={onHumanTurn}
          onBotTurn={onBotTurn}
          onStartVoting={onStartVoting}
          onVote={onVote}
          onRestart={restart}
          onQuit={quit}
        />
      )}
      <ToastArea toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
