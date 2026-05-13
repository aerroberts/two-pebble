/**
 * Selects a random element from a non-empty list.
 * Uses Math.random; not cryptographically secure.
 * Callers must ensure the list contains at least one item.
 */
export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)] as T;
}
