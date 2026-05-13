import { PebbleTraceAggregator } from '../pebble-trace-aggregator';
import type { PebbleAgentAggregatedTrace } from '../types';
import type { AggregatedSubAgentLifecycleTrace, AggregatedSubAgentLifecycleTraceList } from './types';

/**
 * Collapses sub-agent lifecycle traces.
 * Invoke traces own agent identity and request cells.
 * Outcome traces add response cells and status.
 */
export class SubAgentAggregator extends PebbleTraceAggregator {
  /**
   * Groups lifecycle events by sub-agent instance id and replaces complete groups with one trace.
   */
  public aggregate(traces: PebbleAgentAggregatedTrace[]) {
    const eventsById = new Map<string, AggregatedSubAgentLifecycleTraceList>();
    const passthroughTraces: PebbleAgentAggregatedTrace[] = [];

    for (const trace of traces) {
      if (
        trace.type === 'sub-agent-invoke' ||
        trace.type === 'sub-agent-success' ||
        trace.type === 'sub-agent-failure'
      ) {
        const existing = eventsById.get(trace.data.agentInstanceId) ?? [];
        existing.push(trace as AggregatedSubAgentLifecycleTrace);
        eventsById.set(trace.data.agentInstanceId, existing);
      } else {
        passthroughTraces.push(trace);
      }
    }

    for (const events of eventsById.values()) {
      passthroughTraces.push(...this.aggregateSubAgentEvents(events));
    }

    return passthroughTraces;
  }

  private aggregateSubAgentEvents(events: AggregatedSubAgentLifecycleTraceList): PebbleAgentAggregatedTrace[] {
    const invokeTrace = events.find((event) => event.type === 'sub-agent-invoke');
    const failureTrace = events.find((event) => event.type === 'sub-agent-failure');
    const successTrace = events.find((event) => event.type === 'sub-agent-success');

    if (events.length === 0) {
      throw new Error('Sub-agent trace group was empty.');
    }

    if (invokeTrace === undefined) {
      return events;
    }

    if (failureTrace !== undefined) {
      return [this.mergeFailure(invokeTrace, failureTrace)];
    }

    if (successTrace !== undefined) {
      return [this.mergeSuccess(invokeTrace, successTrace)];
    }

    return [this.mergePending(invokeTrace)];
  }

  private mergeFailure(invokeTrace: AggregatedSubAgentLifecycleTrace, failureTrace: AggregatedSubAgentLifecycleTrace) {
    return {
      ...invokeTrace,
      type: 'sub-agent',
      data: {
        ...this.baseSubAgentData(invokeTrace),
        error: failureTrace.type === 'sub-agent-failure' ? failureTrace.data.error : undefined,
        output: failureTrace.type === 'sub-agent-failure' ? failureTrace.data.output : undefined,
        status: 'error',
      },
    } as PebbleAgentAggregatedTrace;
  }

  private mergeSuccess(invokeTrace: AggregatedSubAgentLifecycleTrace, successTrace: AggregatedSubAgentLifecycleTrace) {
    return {
      ...invokeTrace,
      type: 'sub-agent',
      data: {
        ...this.baseSubAgentData(invokeTrace),
        output: successTrace.type === 'sub-agent-success' ? successTrace.data.output : undefined,
        status: 'success',
      },
    } as PebbleAgentAggregatedTrace;
  }

  private mergePending(invokeTrace: AggregatedSubAgentLifecycleTrace) {
    return {
      ...invokeTrace,
      type: 'sub-agent',
      data: {
        ...this.baseSubAgentData(invokeTrace),
        status: 'pending',
      },
    } as PebbleAgentAggregatedTrace;
  }

  private baseSubAgentData(invokeTrace: AggregatedSubAgentLifecycleTrace) {
    if (invokeTrace.type !== 'sub-agent-invoke') {
      throw new Error('Expected sub-agent invoke trace.');
    }
    return {
      agentInstanceId: invokeTrace.data.agentInstanceId,
      agentTemplateId: invokeTrace.data.agentTemplateId,
      input: invokeTrace.data.input,
    };
  }
}
