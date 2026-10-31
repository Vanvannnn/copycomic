// Générateur pseudo-aléatoire déterministe (mulberry32). L'état est un entier
// sérialisable, ce qui rend une partie reproductible et sauvegardable.

export function nextRandom(state: number): [value: number, nextState: number] {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

export function shuffle<T>(items: readonly T[], state: number): [T[], number] {
  const result = [...items];
  let rng = state;
  for (let i = result.length - 1; i > 0; i--) {
    const [r, next] = nextRandom(rng);
    rng = next;
    const j = Math.floor(r * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return [result, rng];
}

/** Hash simple et stable pour dériver des graines (bots, etc.). */
export function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

export function pick<T>(items: readonly T[], seed: number): T {
  const [r] = nextRandom(seed);
  return items[Math.floor(r * items.length)];
}
