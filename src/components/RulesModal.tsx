import { Modal } from './Modal';

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Les règles en 30 secondes"
      onClose={onClose}
      actions={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          C’est parti
        </button>
      }
    >
      <ol className="rules-list">
        <li>
          <strong>Chacun sa BD.</strong> Tu reçois un départ (un lieu + un problème) et tu dessines 4 cases.
        </li>
        <li>
          <strong>À ton tour :</strong> choisis une carte d’inspiration et écris une légende courte. La case se dessine
          toute seule.
        </li>
        <li>
          <strong>Chaos !</strong> Tu peux aussi lancer une carte Chaos sur quelqu’un : sa prochaine case devra intégrer
          la contrainte. Rien n’est jamais effacé.
        </li>
        <li>
          <strong>Finale.</strong> Ta 4e case reçoit une carte Finale qui donne la forme de la conclusion.
        </li>
        <li>
          <strong>Vote.</strong> On révèle les objectifs secrets, on lit les BD et on vote pour sa préférée (pas la
          sienne).
        </li>
      </ol>
      <p className="muted">
        Points : 3 par vote reçu, 2 si ton objectif secret est rempli, 1 par contrainte Chaos intégrée.
      </p>
    </Modal>
  );
}
