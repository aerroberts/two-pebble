import { pickRandom } from './pick-random';
import { ADJECTIVES, COLORS, CREATURES } from './word-lists';

/**
 * Returns a worktree branch name like `silver-brave-axolotl`.
 * Three wordlists: a colour/material, an adjective, and a real-or-mythical creature.
 * Used by both the UI repository settings and the daemon agent launch flow.
 */
export function generateBranchName(): string {
  return `${pickRandom(COLORS)}-${pickRandom(ADJECTIVES)}-${pickRandom(CREATURES)}`;
}
