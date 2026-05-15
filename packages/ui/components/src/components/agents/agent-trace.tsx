'use client';

import { aggregatePebbleAgentTraces as aggregateAgentTraces } from '@two-pebble/pebble';
import { useRef } from 'react';
import { renderAgentTrace } from './render-trace';
import { ToolTraceGroup } from './tool-trace-group';
import type { AgentAggregatedTraceRecord, AgentTraceByType, AgentTraceRecord, SpeakController } from './types';

export interface AgentTraceProps {
  onAgentClick?: (agentId: string) => void;
  onModelCallClick?: (modelCallId: string) => void;
  speakController?: SpeakController;
  onTaskClick?: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick?: (threadCursor: string) => void;
  onWorktreeOpenClick?: (worktreeId: string) => void;
  traces: AgentTraceRecord[];
}

// Trace types that have no visible chat representation. These are intermediate or
// lifecycle-only signals that either fall through `renderAgentTrace` without a case
// or explicitly return `null`. Keeping them in the stream would break adjacency
// detection for tool traces and produce stray empty wrapper divs in the layout,
// so we filter them out before grouping.
const NON_RENDERING_TRACE_TYPES = new Set<AgentAggregatedTraceRecord['type']>([
  'capability-hydrate',
  'signal-received',
  'signal-registered',
  'signal-resolved',
  'sub-agent-failure',
  'sub-agent-invoke',
  'sub-agent-success',
  'tool-call-requested',
  'agent-waiting',
]);

// Renders persisted agent traces through one aggregated trace pipeline.
export function AgentTrace(props: AgentTraceProps) {
  const traces = [...props.traces].sort((left, right) => left.orderId - right.orderId);
  const aggregatedTraces = aggregateAgentTraces(traces)
    .filter((trace) => !NON_RENDERING_TRACE_TYPES.has(trace.type))
    .sort((left, right) => left.orderId - right.orderId);
  const traceGroups = groupAdjacentToolTraces(aggregatedTraces);

  // Track IDs seen on the initial render. Groups whose IDs were not present on
  // the first render are newly-inserted and receive the fade-in animation.
  // Using a ref avoids re-renders and persists across prop updates.
  const initialIdsRef = useRef<Set<string> | null>(null);
  if (initialIdsRef.current === null) {
    initialIdsRef.current = new Set(traceGroups.map((g) => g.id));
  }
  const initialIds = initialIdsRef.current;

  return (
    <div className="flex w-full flex-col gap-2">
      {traceGroups.map((group) => {
        const isNew = !initialIds.has(group.id);
        return (
          <div key={group.id} className={isNew ? 'trace-entry-fade-in' : undefined}>
            {group.type === 'tool-group' ? (
              <ToolTraceGroup traces={group.traces} />
            ) : (
              renderAgentTrace(group.trace, {
                onAgentClick: props.onAgentClick,
                onModelCallClick: props.onModelCallClick,
                speakController: props.speakController,
                onTaskClick: props.onTaskClick,
                onThreadSnapshotClick: props.onThreadSnapshotClick,
                onWorktreeOpenClick: props.onWorktreeOpenClick,
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

type GroupedToolTraces = {
  id: string;
  traces: AgentTraceByType<'tool'>[];
  type: 'tool-group';
};

type SingleTraceGroup = {
  id: string;
  trace: AgentTraceRecord;
  type: 'trace';
};

type TraceGroup = SingleTraceGroup | GroupedToolTraces;

function groupAdjacentToolTraces(traces: AgentTraceRecord[]): TraceGroup[] {
  const groups: TraceGroup[] = [];
  let toolTraces: AgentTraceByType<'tool'>[] = [];

  for (const trace of traces) {
    if (trace.type === 'tool') {
      toolTraces.push(trace);
      continue;
    }

    flushToolGroup(groups, toolTraces);
    toolTraces = [];
    groups.push({ id: trace.id, trace, type: 'trace' });
  }

  flushToolGroup(groups, toolTraces);

  return groups;
}

function flushToolGroup(groups: TraceGroup[], toolTraces: AgentTraceByType<'tool'>[]) {
  if (toolTraces.length === 0) {
    return;
  }

  groups.push({ id: toolTraces.map((trace) => trace.id).join(':'), traces: toolTraces, type: 'tool-group' });
}
