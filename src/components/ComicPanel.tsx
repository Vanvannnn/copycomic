import { PanelArt } from '../art/PanelArt';
import { getChaos, getFinale } from '../game/data';
import type { Panel, PanelComposition } from '../game/types';

interface ComicPanelProps {
  panel?: Panel;
  /** Aperçu d'une case en cours de création. */
  preview?: { composition: PanelComposition; caption: string; constraintId?: string; finaleId?: string };
  index: number;
  total: number;
  authorOf?: (playerId: string) => string;
}

export function ComicPanel({ panel, preview, index, total, authorOf }: ComicPanelProps) {
  if (!panel && !preview) {
    return (
      <figure className="comic-panel empty" aria-label={`Case ${index + 1} sur ${total} : pas encore dessinée`}>
        <div className="panel-frame empty-frame">
          <span className="empty-num">{index + 1}</span>
        </div>
        <figcaption className="panel-caption muted">Case à venir…</figcaption>
      </figure>
    );
  }

  const composition = panel?.composition ?? preview!.composition;
  const caption = panel?.caption ?? preview!.caption;
  const constraintId = panel?.constraint?.cardId ?? preview?.constraintId;
  const finaleId = panel?.finaleId ?? preview?.finaleId;
  const from = panel?.constraint && authorOf ? authorOf(panel.constraint.fromPlayerId) : undefined;

  return (
    <figure className={`comic-panel${preview ? ' is-preview' : ''}${finaleId ? ' is-finale' : ''}`}>
      <div className="panel-frame">
        <span className="panel-num" aria-hidden="true">
          {index + 1}
        </span>
        <PanelArt composition={composition} />
        <div className="stamps">
          {constraintId && (
            <span className="stamp stamp-chaos" title={getChaos(constraintId).constraint}>
              Chaos{from ? ` · ${from}` : ''}
            </span>
          )}
          {finaleId && <span className="stamp stamp-finale">Finale · {getFinale(finaleId).title}</span>}
        </div>
      </div>
      <figcaption className={`panel-caption${caption ? '' : ' muted'}`}>
        <span className="visually-hidden">Case {index + 1} : </span>
        {caption || 'Ta légende apparaîtra ici.'}
      </figcaption>
    </figure>
  );
}
