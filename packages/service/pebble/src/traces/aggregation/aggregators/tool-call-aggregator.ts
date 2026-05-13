import { PebbleTraceAggregator } from '../pebble-trace-aggregator';
import type { PebbleAgentAggregatedTrace } from '../types';
import type { AggregatedToolLifecycleTrace, AggregatedToolLifecycleTraceList } from './types';

/**
 * Collapses tool call lifecycle traces.
 * Start traces own tool identity and input.
 * Outcome traces add result, status, and duration.
 */
export class ToolCallAggregator extends PebbleTraceAggregator {
  /**
   * Groups tool call lifecycle events by call id.
   * Finished calls become one renderable tool trace.
   * Pending calls remain a single pending tool trace.
   */
  public aggregate(traces: PebbleAgentAggregatedTrace[]) {
    const toolEventsById = new Map<string, AggregatedToolLifecycleTraceList>();
    const passthroughTraces: PebbleAgentAggregatedTrace[] = [];

    for (const trace of traces) {
      if (
        trace.type === 'tool-call-start' ||
        trace.type === 'tool-call-success' ||
        trace.type === 'tool-call-failure'
      ) {
        const toolCallId = trace.type === 'tool-call-start' ? trace.data.callId : trace.data.toolCallId;
        const existing = toolEventsById.get(toolCallId) ?? [];
        existing.push(trace as AggregatedToolLifecycleTrace);
        toolEventsById.set(toolCallId, existing);
      } else {
        passthroughTraces.push(trace);
      }
    }

    for (const toolEvents of toolEventsById.values()) {
      passthroughTraces.push(...this.aggregateToolEvents(toolEvents));
    }

    return passthroughTraces;
  }

  private aggregateToolEvents(events: AggregatedToolLifecycleTraceList): PebbleAgentAggregatedTrace[] {
    const startTrace = events.find((event) => event.type === 'tool-call-start');
    const failureTrace = events.find((event) => event.type === 'tool-call-failure');
    const successTrace = events.find((event) => event.type === 'tool-call-success');

    if (events.length === 0) {
      throw new Error('Tool call trace group was empty.');
    }

    if (startTrace === undefined) {
      return events;
    }

    const toolCallId = startTrace.data.callId;
    const toolId = startTrace.data.toolId;
    const input = startTrace.data.input;
    const source = startTrace.data.source;

    if (failureTrace !== undefined) {
      return [
        {
          ...startTrace,
          type: 'tool',
          data: {
            duration: this.computeTraceDuration(startTrace, failureTrace),
            error: failureTrace.data.error,
            input,
            result: failureTrace.data.result,
            source,
            status: 'error',
            toolCallId,
            toolId,
          },
        } as PebbleAgentAggregatedTrace,
      ];
    }

    if (successTrace !== undefined) {
      return [
        {
          ...startTrace,
          type: 'tool',
          data: {
            duration: this.computeTraceDuration(startTrace, successTrace),
            input,
            result: successTrace.data.result,
            source,
            status: 'success',
            toolCallId,
            toolId,
          },
        } as PebbleAgentAggregatedTrace,
      ];
    }

    return [
      {
        ...startTrace,
        type: 'tool',
        data: {
          input,
          source,
          status: 'pending',
          toolCallId,
          toolId,
        },
      } as PebbleAgentAggregatedTrace,
    ];
  }
}
