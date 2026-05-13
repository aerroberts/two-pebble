/**
 * Sentinel token emitted by agents to mark the end of a model turn.
 *
 * Chat providers pass it as a stop sequence to avoid token-by-token tails.
 */
export const END_TURN_STOP_TOKEN = 'END_TURN';
