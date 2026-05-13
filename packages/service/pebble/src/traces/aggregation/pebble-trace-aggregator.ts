import type { PebbleAgentAggregatedTrace, TracePropertySource } from './types';

/**
 * Defines one trace aggregation pass.
 * Aggregators own one lifecycle collapse rule.
 * The shared helpers keep ordering and duration reads consistent.
 */
export abstract class PebbleTraceAggregator {
  /**
   * Collapses one trace lifecycle family.
   * Implementations preserve unrelated traces.
   * The returned list is ready for the next aggregation pass.
   */
  public abstract aggregate(traces: PebbleAgentAggregatedTrace[]): PebbleAgentAggregatedTrace[];

  protected computeTraceDuration(startTrace: TracePropertySource, endTrace: TracePropertySource): number | undefined {
    const startedAt = this.readTraceTime(startTrace);
    const endedAt = this.readTraceTime(endTrace);

    if (startedAt === undefined || endedAt === undefined) {
      return undefined;
    }

    return endedAt - startedAt;
  }

  private readTraceTime(trace: TracePropertySource): number | undefined {
    return trace.createdAt ?? trace.timestamp;
  }
}
