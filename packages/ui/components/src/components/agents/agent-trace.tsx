'use client';

import { aggregatePebbleAgentTraces as aggregateAgentTraces } from '@two-pebble/pebble';
import { renderAgentTrace } from './render-trace';
import { ToolTraceGroup } from './tool-trace-group';
import type { AgentTraceByType, AgentTraceRecord, SpeakController } from './types';

export interface AgentTraceProps {
  onAgentClick?: (agentId: string) => void;
  onModelCallClick?: (modelCallId: string) => void;
  speakController?: SpeakController;
  onTaskClick?: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick?: (threadCursor: string) => void;
  onWorktreeOpenClick?: (worktreeId: string) => void;
  traces: AgentTraceRecord[];
}

// Renders persisted agent traces through one aggregated trace pipeline.
export function AgentTrace(props: AgentTraceProps) {
  const traces = [...props.traces].sort((left, right) => left.orderId - right.orderId);
  const aggregatedTraces = aggregateAgentTraces(traces).sort((left, right) => left.orderId - right.orderId);
  const traceGroups = groupAdjacentToolTraces(aggregatedTraces);

  return (
    <div className="flex w-full flex-col gap-2">
      {traceGroups.map((group) => (
        <div key={group.id}>
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
      ))}
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
