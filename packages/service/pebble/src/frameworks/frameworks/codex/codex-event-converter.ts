import type { ThreadEvent } from '@openai/codex-sdk';
import { type ConvertedCodexEvent, convertThreadEvent } from './codex-trace-mapping';

/**
 * Converts Codex SDK `ThreadEvent`s into the Pebble events the framework
 * adapter publishes. Pure: no IO, no async, no SDK process — every method
 * is synchronous and the converter can be unit tested in isolation.
 *
 * The Codex SDK reports usage on `turn.completed` but not which model was
 * served, so callers thread the configured model id through. Defaults are
 * applied downstream in `normalizeCodexModelId`.
 */
export class CodexEventConverter {
  /** Translates a single SDK thread event into Pebble events. */
  public convertEvent(event: ThreadEvent, modelId: string | undefined): ConvertedCodexEvent[] {
    return convertThreadEvent(event, modelId);
  }
}
