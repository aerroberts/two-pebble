import type { PebbleAgentTrace } from '../types';
import { ModelCallAggregator } from './aggregators/model-call-aggregator';
import { SubAgentAggregator } from './aggregators/sub-agent-aggregator';
import { TaskListAggregator } from './aggregators/task-list-aggregator';
import { ToolCallAggregator } from './aggregators/tool-call-aggregator';
import type { PebbleTraceAggregator } from './pebble-trace-aggregator';
import type {
  PebbleAgentAggregatedTrace,
  PebbleAgentAggregatedTraceList,
  TracePropertyKey,
  TracePropertySource,
} from './types';

/**
 * Runs the ordered trace aggregation pipeline.
 * Each pass collapses one lifecycle family.
 * Final output is sorted back into trace order.
 */
export class TraceAggregator<TTrace extends PebbleAgentTrace = PebbleAgentTrace> {
  private readonly aggregators: PebbleTraceAggregator[] = [];
  private readonly inputTraces: PebbleAgentAggregatedTraceList<TTrace> = [];

  /**
   * Stores the input trace list for a single aggregation run.
   * Aggregators are stateless and reused by order.
   * The caller keeps ownership of the original array.
   */
  public constructor(inputTraces: TTrace[]) {
    this.inputTraces = inputTraces;
    this.aggregators.push(new TaskListAggregator());
    this.aggregators.push(new ToolCallAggregator());
    this.aggregators.push(new ModelCallAggregator());
    this.aggregators.push(new SubAgentAggregator());
  }

  /**
   * Applies each lifecycle aggregation pass.
   * The resulting trace list preserves unrelated events.
   * Ordering falls back to timestamps when explicit order is absent.
   */
  public aggregate(): PebbleAgentAggregatedTraceList<TTrace> {
    let traces: PebbleAgentAggregatedTrace[] = [...this.inputTraces];

    for (const aggregator of this.aggregators) {
      traces = aggregator.aggregate(traces);
    }

    traces.sort((left, right) => {
      const leftOrder = this.readNumericProperty(left, 'orderId') ?? this.readNumericProperty(left, 'sequenceId');
      const rightOrder = this.readNumericProperty(right, 'orderId') ?? this.readNumericProperty(right, 'sequenceId');

      if (leftOrder !== undefined && rightOrder !== undefined && leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const leftTimestamp =
        this.readNumericProperty(left, 'createdAt') ?? this.readNumericProperty(left, 'timestamp') ?? 0;
      const rightTimestamp =
        this.readNumericProperty(right, 'createdAt') ?? this.readNumericProperty(right, 'timestamp') ?? 0;

      if (leftTimestamp !== rightTimestamp) {
        return leftTimestamp - rightTimestamp;
      }

      return (leftOrder ?? 0) - (rightOrder ?? 0);
    });

    return traces as PebbleAgentAggregatedTraceList<TTrace>;
  }

  private readNumericProperty(value: TracePropertySource, key: TracePropertyKey): number | undefined {
    return value[key];
  }
}
