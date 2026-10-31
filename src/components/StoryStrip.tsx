import type { ReactNode } from 'react';
import { CHARACTER_SPRITES } from '../art/characters';
import { PixelIcon } from '../art/pixel';
import { getChaos, getStart } from '../game/data';
import { avatarFor } from '../game/session';
import type { GameState, Player } from '../game/types';
import { ComicPanel } from './ComicPanel';

interface StoryStripProps {
  state: GameState;
  player: Player;
  isActive?: boolean;
  isYou?: boolean;
  footer?: ReactNode;
  headingLevel?: 'h2' | 'h3';
}

export function StoryStrip({ state, player, isActive, isYou, footer, headingLevel = 'h3' }: StoryStripProps) {
  const start = getStart(player.startId);
  const avatar = CHARACTER_SPRITES[avatarFor(state, player)];
  const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? '?';
  const Heading = headingLevel;
  return (
    <section className={`story${isActive ? ' is-active' : ''}${isYou ? ' is-you' : ''}`} aria-label={`BD de ${player.name}`}>
      <header className="story-head">
        <PixelIcon rows={avatar.rows} palette={avatar.palette} size={34} />
        <div className="story-title">
          <Heading>
            {player.name}
            {isYou && <span className="tag">toi</span>}
            {player.isBot && <span className="tag tag-bot">bot</span>}
          </Heading>
          <p className="story-start">
            <strong>{start.place}</strong>, mais {start.problem}
          </p>
        </div>
        {isActive && <span className="turn-pill">joue</span>}
      </header>
      {player.pendingConstraint && (
        <p className="pending-chaos">
          <span className="chaos-dot" aria-hidden="true" />
          Contrainte en attente pour sa prochaine case : « {getChaos(player.pendingConstraint.cardId).constraint} »
          <span className="muted"> (de {nameOf(player.pendingConstraint.fromPlayerId)})</span>
        </p>
      )}
      <div className="strip" tabIndex={0} aria-label={`Cases de ${player.name}`}>
        {Array.from({ length: state.panelsPerStory }, (_, i) => (
          <ComicPanel key={i} panel={player.panels[i]} index={i} total={state.panelsPerStory} authorOf={nameOf} />
        ))}
      </div>
      {footer}
    </section>
  );
}
