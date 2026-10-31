import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  UNLOCK_PRESSES,
  UNLOCK_RESET_MS,
  initialCounter,
  isCountableKey,
  registerPress,
} from '../src/hooks/secretUnlock';
import { useSecretUnlock } from '../src/hooks/useSecretUnlock';

function pressMany(times: number, gap = 100) {
  let counter = initialCounter;
  let unlocked = false;
  for (let i = 0; i < times; i++) {
    const r = registerPress(counter, 1000 + i * gap);
    counter = r.counter;
    unlocked = unlocked || r.unlocked;
  }
  return { counter, unlocked };
}

describe('registerPress', () => {
  it('déverrouille à la 15e pression', () => {
    expect(UNLOCK_PRESSES).toBe(15);
    expect(pressMany(15).unlocked).toBe(true);
  });

  it('ne déverrouille pas avec 14 pressions', () => {
    const r = pressMany(14);
    expect(r.unlocked).toBe(false);
    expect(r.counter.count).toBe(14);
  });

  it('remet le compteur à zéro après un délai sans pression', () => {
    let { counter } = pressMany(10);
    const late = registerPress(counter, (counter.lastAt ?? 0) + UNLOCK_RESET_MS + 1);
    expect(late.counter.count).toBe(1);
    counter = late.counter;
    for (let i = 0; i < 4; i++) counter = registerPress(counter, (counter.lastAt ?? 0) + 50).counter;
    expect(counter.count).toBe(5);
  });
});

describe('isCountableKey', () => {
  const base = { key: 't', repeat: false, ctrlKey: false, metaKey: false, altKey: false, target: document.body };

  it('accepte t et T', () => {
    expect(isCountableKey(base)).toBe(true);
    expect(isCountableKey({ ...base, key: 'T' })).toBe(true);
  });

  it('ignore les répétitions automatiques', () => {
    expect(isCountableKey({ ...base, repeat: true })).toBe(false);
  });

  it('ignore les autres touches et les raccourcis', () => {
    expect(isCountableKey({ ...base, key: 'y' })).toBe(false);
    expect(isCountableKey({ ...base, ctrlKey: true })).toBe(false);
    expect(isCountableKey({ ...base, metaKey: true })).toBe(false);
  });

  it('ignore la saisie dans un champ', () => {
    expect(isCountableKey({ ...base, target: document.createElement('input') })).toBe(false);
    expect(isCountableKey({ ...base, target: document.createElement('textarea') })).toBe(false);
  });
});

function Harness({ enabled = true }: { enabled?: boolean }) {
  const [unlocked, setUnlocked] = useState(false);
  const onTap = useSecretUnlock(enabled, () => setUnlocked(true));
  return (
    <div>
      <input aria-label="champ" />
      <div data-testid="logo" onClick={onTap} />
      <p>{unlocked ? 'débloqué' : 'verrouillé'}</p>
    </div>
  );
}

describe('useSecretUnlock', () => {
  it('se déverrouille avec 15 vraies pressions sur la fenêtre', () => {
    render(<Harness />);
    for (let i = 0; i < 14; i++) fireEvent.keyDown(window, { key: 't' });
    expect(screen.getByText('verrouillé')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'T' });
    expect(screen.getByText('débloqué')).toBeInTheDocument();
  });

  it('ne compte pas une touche maintenue (repeat)', () => {
    render(<Harness />);
    fireEvent.keyDown(window, { key: 't' });
    for (let i = 0; i < 30; i++) fireEvent.keyDown(window, { key: 't', repeat: true });
    expect(screen.getByText('verrouillé')).toBeInTheDocument();
  });

  it('ne compte pas les T tapés dans un champ de texte', () => {
    render(<Harness />);
    const input = screen.getByLabelText('champ');
    for (let i = 0; i < 20; i++) fireEvent.keyDown(input, { key: 't' });
    expect(screen.getByText('verrouillé')).toBeInTheDocument();
  });

  it('est inactif quand il est désactivé (hors menu)', () => {
    render(<Harness enabled={false} />);
    for (let i = 0; i < 20; i++) fireEvent.keyDown(window, { key: 't' });
    for (let i = 0; i < 20; i++) fireEvent.click(screen.getByTestId('logo'));
    expect(screen.getByText('verrouillé')).toBeInTheDocument();
  });

  it('se déverrouille avec 15 appuis sur le logo', () => {
    render(<Harness />);
    for (let i = 0; i < 15; i++) fireEvent.click(screen.getByTestId('logo'));
    expect(screen.getByText('débloqué')).toBeInTheDocument();
  });
});
