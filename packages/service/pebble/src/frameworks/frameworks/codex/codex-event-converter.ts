import type { ThreadEvent } from '@openai/codex-sdk';
import type { TaskListUpdateTask } from '../../../traces';
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
  // Most recently emitted task list snapshot. The pure helper mutates this
  // shared reference when a todo_list event arrives so successive snapshots
  // can be diffed for real status transitions.
  private previousTaskList: TaskListUpdateTask[] = [];

  /**
   * Translates a single SDK thread event into Pebble events. Delegates to
   * the pure `convertThreadEvent` helper so trace shape can be unit tested
   * without spinning up the SDK process.
   */
  public convertEvent(event: ThreadEvent, modelId: string | undefined): ConvertedCodexEvent[] {
    const context = { modelId, previousTaskList: this.previousTaskList };
    const events = convertThreadEvent(event, context);
    this.previousTaskList = context.previousTaskList;
    return events;
  }
}
