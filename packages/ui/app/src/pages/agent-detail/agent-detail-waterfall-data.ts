import type { TimelineChartItem, TimelineMetric } from '@two-pebble/components';
import type { AgentRecord, AgentTraceRecord } from '@two-pebble/realtime';

type SubAgentWaterfallStatus = 'error' | 'pending' | 'success';

export type WaterfallAgentMap = Map<string, AgentRecord>;

export interface BuildWaterfallItemsInput {
  agents: WaterfallAgentMap;
  traces: AgentTraceRecord[];
}

export function buildWaterfallItems(input: BuildWaterfallItemsInput): TimelineChartItem[] {
  return [
    ...buildModelCallWaterfallItems(input),
    ...buildToolWaterfallItems(input),
    ...buildSubAgentWaterfallItems(input),
  ].sort((left, right) => Number(left.startTime) - Number(right.startTime));
}

function buildModelCallWaterfallItems(input: BuildWaterfallItemsInput): TimelineChartItem[] {
  const outcomes = new Map<string, AgentTraceRecord>();
  for (const trace of input.traces) {
    if (trace.type === 'model-call-success' || trace.type === 'model-call-failure') {
      outcomes.set(trace.data.modelCallId, trace);
    }
  }

  return input.traces.flatMap((trace) => {
    if (trace.type !== 'model-call-start') {
      return [];
    }

    const outcome = outcomes.get(trace.data.modelCallId);
    return [
      {
        id: `model-call:${trace.data.modelCallId}`,
        label: `${trace.data.provider}/${trace.data.modelId}`,
        category: 'Model Calls',
        startTime: trace.createdAt,
        ...(outcome === undefined ? {} : { endTime: outcome.createdAt }),
        status: readWaterfallStatus(outcome),
        metrics: agentMetrics(trace, input.agents, [{ label: 'id', value: trace.data.modelCallId }]),
      },
    ];
  });
}

function buildToolWaterfallItems(input: BuildWaterfallItemsInput): TimelineChartItem[] {
  const outcomes = new Map<string, AgentTraceRecord>();
  for (const trace of input.traces) {
    if (trace.type === 'tool-call-success' || trace.type === 'tool-call-failure') {
      outcomes.set(trace.data.toolCallId, trace);
    }
  }

  return input.traces.flatMap((trace) => {
    if (trace.type !== 'tool-call-start') {
      return [];
    }

    const outcome = outcomes.get(trace.data.callId);
    return [
      {
        id: `tool:${trace.data.callId}`,
        label: trace.data.toolId,
        category: 'Tools',
        startTime: trace.createdAt,
        ...(outcome === undefined ? {} : { endTime: outcome.createdAt }),
        status: readWaterfallStatus(outcome),
        metrics: agentMetrics(trace, input.agents, [
          { label: 'call', value: trace.data.callId },
          { label: 'source', value: trace.data.source ?? 'unknown' },
        ]),
      },
    ];
  });
}

function buildSubAgentWaterfallItems(input: BuildWaterfallItemsInput): TimelineChartItem[] {
  const outcomes = new Map<string, AgentTraceRecord>();
  const aggregatedItems: TimelineChartItem[] = [];

  for (const trace of input.traces) {
    if (trace.type === 'sub-agent-success' || trace.type === 'sub-agent-failure') {
      outcomes.set(trace.data.agentInstanceId, trace);
    }

    if (trace.type === 'sub-agent') {
      const subAgent = input.agents.get(trace.data.agentInstanceId);
      const startTime = subAgent?.startedAt ?? trace.createdAt;
      const endTime = readSubAgentEndTime(subAgent?.completedAt);
      aggregatedItems.push({
        id: `sub-agent:${trace.data.agentInstanceId}`,
        label: trace.data.agentTemplateId,
        category: 'Sub-agents',
        startTime,
        ...(endTime === undefined ? {} : { endTime }),
        status: readSubAgentStatus(trace.data.status),
        metrics: agentMetrics(trace, input.agents, [
          { label: 'instance', value: trace.data.agentInstanceId },
          { label: 'template', value: trace.data.agentTemplateId },
        ]),
      });
    }
  }

  const lifecycleItems = input.traces.flatMap((trace) => {
    if (trace.type !== 'sub-agent-invoke') {
      return [];
    }

    const outcome = outcomes.get(trace.data.agentInstanceId);
    const subAgent = input.agents.get(trace.data.agentInstanceId);
    const startTime = subAgent?.startedAt ?? trace.createdAt;
    const endTime = outcome === undefined ? undefined : readSubAgentEndTime(subAgent?.completedAt);
    return [
      {
        id: `sub-agent:${trace.data.agentInstanceId}`,
        label: trace.data.agentTemplateId,
        category: 'Sub-agents',
        startTime,
        ...(endTime === undefined ? {} : { endTime }),
        status: readWaterfallStatus(outcome),
        metrics: agentMetrics(trace, input.agents, [
          { label: 'instance', value: trace.data.agentInstanceId },
          { label: 'template', value: trace.data.agentTemplateId },
        ]),
      },
    ];
  });

  return lifecycleItems.length > 0 ? lifecycleItems : aggregatedItems;
}

function agentMetrics(trace: AgentTraceRecord, agents: WaterfallAgentMap, metrics: TimelineMetric[]) {
  const agentId = trace.agentId ?? '';
  const agent = agents.get(agentId);
  if (agent === undefined) {
    return metrics;
  }
  return [{ label: 'agent', value: agent.name }, ...metrics];
}

function readWaterfallStatus(outcome: AgentTraceRecord | undefined) {
  if (outcome === undefined) {
    return 'in-progress' as const;
  }

  if (
    outcome.type === 'model-call-failure' ||
    outcome.type === 'tool-call-failure' ||
    outcome.type === 'sub-agent-failure'
  ) {
    return 'failed' as const;
  }

  return 'success' as const;
}

function readSubAgentStatus(status: SubAgentWaterfallStatus) {
  if (status === 'error') {
    return 'failed' as const;
  }
  if (status === 'pending') {
    return 'in-progress' as const;
  }
  return 'success' as const;
}

function readSubAgentEndTime(completedAt: number | undefined) {
  if (completedAt !== undefined && completedAt > 0) {
    return completedAt;
  }
  return undefined;
}
