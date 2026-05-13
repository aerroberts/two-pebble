import { PebbleTraceAggregator } from '../pebble-trace-aggregator';
import type { PebbleAgentAggregatedTrace } from '../types';

/**
 * Collapses redundant `task-list-update` traces. Within a turn (delimited
 * by `turn-start` traces — emitted by Pebble agents) only the last
 * task-list-update is kept; earlier ones in the same turn are discarded.
 *
 * Threads that have no `turn-start` traces (typically framework-driven
 * agents) skip aggregation entirely — without turn boundaries we cannot
 * tell stale updates from intentional successive snapshots, so every
 * task-list-update passes through.
 *
 * Task lists only ever have a single trace type (`task-list-update`); we
 * never carry separate create/delete events. A snapshot replaces the
 * previous one — the latest trace fully describes current state.
 */
export class TaskListAggregator extends PebbleTraceAggregator {
  /**
   * Filters the trace list down to one task-list-update per turn (the
   * last in source order). All other traces pass through untouched. When
   * the thread has no turns at all, every task-list-update passes through.
   */
  public aggregate(traces: PebbleAgentAggregatedTrace[]): PebbleAgentAggregatedTrace[] {
    if (!traces.some((trace) => trace.type === 'turn-start')) return traces;
    const lastInTurnByIndex = this.findLastTaskListUpdatePerTurn(traces);
    const result: PebbleAgentAggregatedTrace[] = [];
    for (const [index, trace] of traces.entries()) {
      if (trace.type !== 'task-list-update') {
        result.push(trace);
        continue;
      }
      if (lastInTurnByIndex.has(index)) result.push(trace);
    }
    return result;
  }

  private findLastTaskListUpdatePerTurn(traces: PebbleAgentAggregatedTrace[]): Set<number> {
    const lastIndices = new Set<number>();
    let pendingLast: number | undefined;
    for (const [index, trace] of traces.entries()) {
      if (trace.type === 'turn-start') {
        if (pendingLast !== undefined) lastIndices.add(pendingLast);
        pendingLast = undefined;
        continue;
      }
      if (trace.type === 'task-list-update') pendingLast = index;
    }
    if (pendingLast !== undefined) lastIndices.add(pendingLast);
    return lastIndices;
  }
}
