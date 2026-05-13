import { pickRandom } from './pick-random';
import { ADJECTIVES, HUMAN_NAMES } from './word-lists';

/**
 * Returns an agent name like `studious-bart`, combining an adjective with a human first name.
 */
export function generateAgentName(): string {
  return `${pickRandom(ADJECTIVES)}-${pickRandom(HUMAN_NAMES)}`;
}
