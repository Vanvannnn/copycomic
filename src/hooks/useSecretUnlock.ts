import { useCallback, useEffect, useRef } from 'react';
import { initialCounter, isCountableKey, registerPress } from './secretUnlock';

/**
 * Écoute les pressions sur « T » tant que `enabled` est vrai (menu principal uniquement)
 * et renvoie un gestionnaire pour l'équivalent tactile (appuis sur le logo).
 */
export function useSecretUnlock(enabled: boolean, onUnlock: () => void): () => void {
  const keyCounter = useRef(initialCounter);
  const tapCounter = useRef(initialCounter);
  const onUnlockRef = useRef(onUnlock);

  useEffect(() => {
    onUnlockRef.current = onUnlock;
  }, [onUnlock]);

  useEffect(() => {
    keyCounter.current = initialCounter;
    tapCounter.current = initialCounter;
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (!isCountableKey(event)) return;
      const { counter, unlocked } = registerPress(keyCounter.current, Date.now());
      keyCounter.current = counter;
      if (unlocked) onUnlockRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled]);

  return useCallback(() => {
    if (!enabled) return;
    const { counter, unlocked } = registerPress(tapCounter.current, Date.now());
    tapCounter.current = counter;
    if (unlocked) onUnlockRef.current();
  }, [enabled]);
}
