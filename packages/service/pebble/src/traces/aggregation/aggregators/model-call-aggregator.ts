import { PebbleTraceAggregator } from '../pebble-trace-aggregator';
import type { PebbleAgentAggregatedTrace } from '../types';
import type {
  AggregatedModelLifecycleTrace,
  AggregatedModelLifecycleTraceList,
  AggregatedModelStartTrace,
} from './types';

/**
 * Collapses model call lifecycle traces.
 * Start traces provide provider and model metadata.
 * Outcome traces provide success or failure state.
 */
export class ModelCallAggregator extends PebbleTraceAggregator {
  /**
   * Groups model call lifecycle events by model call id.
   * Completed calls become one outcome trace.
   * Pending or orphaned events remain visible.
   */
  public aggregate(traces: PebbleAgentAggregatedTrace[]) {
    const startsByModelCallId = new Map<string, AggregatedModelStartTrace>();
    const outcomesByModelCallId = new Map<string, AggregatedModelLifecycleTraceList>();
    const passthroughTraces: PebbleAgentAggregatedTrace[] = [];

    for (const trace of traces) {
      if (trace.type === 'model-call-start') {
        startsByModelCallId.set(trace.data.modelCallId, trace as AggregatedModelStartTrace);
        continue;
      }

      if (trace.type === 'model-call-success' || trace.type === 'model-call-failure') {
        const existing = outcomesByModelCallId.get(trace.data.modelCallId) ?? [];
        existing.push(trace as AggregatedModelLifecycleTrace);
        outcomesByModelCallId.set(trace.data.modelCallId, existing);
        continue;
      }

      passthroughTraces.push(trace);
    }

    for (const [modelCallId, startTrace] of startsByModelCallId.entries()) {
      passthroughTraces.push(this.aggregateModelEvents(startTrace, outcomesByModelCallId.get(modelCallId) ?? []));
      outcomesByModelCallId.delete(modelCallId);
    }

    for (const orphanedOutcomes of outcomesByModelCallId.values()) {
      passthroughTraces.push(...orphanedOutcomes);
    }

    return passthroughTraces;
  }

  private aggregateModelEvents(
    startTrace: AggregatedModelStartTrace,
    outcomes: AggregatedModelLifecycleTraceList,
  ): PebbleAgentAggregatedTrace {
    const failureTrace = outcomes.find((trace) => trace.type === 'model-call-failure');
    const successTrace = outcomes.find((trace) => trace.type === 'model-call-success');
    const outcomeTrace = failureTrace ?? successTrace;

    if (outcomeTrace === undefined) {
      return startTrace;
    }

    const merged = {
      ...startTrace,
      type: outcomeTrace.type,
      data: {
        ...startTrace.data,
        ...outcomeTrace.data,
        duration: this.computeTraceDuration(startTrace, outcomeTrace),
      },
    };
    return merged as PebbleAgentAggregatedTrace;
  }
}
