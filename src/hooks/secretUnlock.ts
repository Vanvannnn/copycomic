// Logique pure du déverrouillage caché du mode test (15 pressions sur « T »).

export const UNLOCK_PRESSES = 15;
/** Délai maximal entre deux pressions avant remise à zéro du compteur. */
export const UNLOCK_RESET_MS = 2000;

export interface UnlockCounter {
  count: number;
  lastAt: number | null;
}

export const initialCounter: UnlockCounter = { count: 0, lastAt: null };

export function registerPress(
  counter: UnlockCounter,
  now: number,
  required = UNLOCK_PRESSES,
  resetMs = UNLOCK_RESET_MS,
): { counter: UnlockCounter; unlocked: boolean } {
  const expired = counter.lastAt !== null && now - counter.lastAt > resetMs;
  const count = (expired ? 0 : counter.count) + 1;
  if (count >= required) return { counter: initialCounter, unlocked: true };
  return { counter: { count, lastAt: now }, unlocked: false };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as HTMLElement).tagName !== 'string') return false;
  const el = target as HTMLElement;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

/** Une pression ne compte que si c'est un vrai « T », hors saisie et hors répétition automatique. */
export function isCountableKey(event: Pick<KeyboardEvent, 'key' | 'repeat' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target'>): boolean {
  if (event.repeat) return false;
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (event.key !== 't' && event.key !== 'T') return false;
  return !isEditableTarget(event.target);
}
