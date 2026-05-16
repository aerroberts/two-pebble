import type { CellContent } from '@two-pebble/pebble';
import type { AgentSignalWireRecord } from '@two-pebble/protocol';
import {
  type AgentRecord,
  useAgentCalls,
  useAgentLiveness,
  useAgentPriceLineItems,
  useAgents,
  useAgentTraces,
  useFreshStartAgent,
  useOpenWorktree,
  useRealtimeDatastore,
  useSendAgentMessage,
  useStopAgent,
} from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { threadSnapshotPath } from '../../shared/routing/thread-pointer';
import { parseAgentDetailViewMode } from './agent-detail.types';
import { readAgentPriceLineItems } from './agent-detail-price-data';
import { buildWaterfallItems } from './agent-detail-waterfall-data';
import type { WaterfallScope } from './agent-detail-waterfall-view';

export function useAgentDetailPageState() {
  const params = useParams();
  const agentId = params.agentId ?? '';
  const agents = useAgents();
  const modelCalls = useAgentCalls({ agentId });
  const agent = agents.getItem(agentId)?.value ?? null;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = parseAgentDetailViewMode(searchParams.get('view') ?? '');
  const [waterfallScope, setWaterfallScope] = useState<WaterfallScope>('this-agent');
  const [chatError, setChatError] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const sendAgentMessage = useSendAgentMessage();
  const stopAgent = useStopAgent();
  const freshStartAgent = useFreshStartAgent();
  const liveness = useAgentLiveness(agentId);
  const datastore = useRealtimeDatastore();
  const [stopping, setStopping] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [waitingSignals, setWaitingSignals] = useState<AgentSignalWireRecord[]>([]);
  const isWaiting = agent?.status === 'waiting';
  useEffect(() => {
    if (!isWaiting || agentId.length === 0) {
      setWaitingSignals([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await datastore.emit('listAgentSignals', { agentId });
        if (cancelled) {
          return;
        }
        setWaitingSignals(result.items.filter((signal) => signal.status === 'open'));
      } catch {
        if (!cancelled) {
          setWaitingSignals([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId, datastore, isWaiting]);
  const waitingReasons = useMemo(
    () => waitingSignals.map((signal) => (signal.name.length > 0 ? signal.name : signal.capabilityId)),
    [waitingSignals],
  );
  const descendantAgentIds = useMemo(() => readDescendantAgentIds(agentId, agents.values()), [agentId, agents]);
  const waterfallAgentIds = useMemo(
    () => (waterfallScope === 'all-children' ? [agentId, ...descendantAgentIds] : [agentId]),
    [agentId, descendantAgentIds, waterfallScope],
  );
  const traceAgentIds = useMemo(
    () => (viewMode === 'waterfall' ? waterfallAgentIds : [agentId]),
    [agentId, viewMode, waterfallAgentIds],
  );
  const traces = useAgentTraces({ agentId, agentIds: traceAgentIds });
  const agentTraces = useMemo(
    () =>
      traces
        .values()
        .filter((trace) => trace.agentId === agentId)
        .sort((left, right) => left.orderId - right.orderId),
    [agentId, traces],
  );
  const modelCallSummaries = useMemo(
    () => modelCalls.values().filter((call) => call.agentId === agentId),
    [agentId, modelCalls],
  );
  const priceLineItemState = useAgentPriceLineItems({ agentId: viewMode === 'price' ? agentId : '' });
  const waterfallTraces = useMemo(
    () =>
      traces
        .values()
        .filter((trace) => waterfallAgentIds.includes(trace.agentId ?? ''))
        .sort((left, right) => left.createdAt - right.createdAt || left.orderId - right.orderId),
    [traces, waterfallAgentIds],
  );
  const agentById = useMemo(() => new Map(agents.values().map((item) => [item.id, item])), [agents]);
  const waterfallItems = useMemo(
    () => buildWaterfallItems({ agents: agentById, traces: waterfallTraces }),
    [agentById, waterfallTraces],
  );
  const priceLineItems = useMemo(
    () => readAgentPriceLineItems(agentId, modelCallSummaries, priceLineItemState.lineItems.values()),
    [agentId, modelCallSummaries, priceLineItemState.lineItems],
  );
  const traceTimeRange = useMemo(() => {
    if (agentTraces.length === 0) {
      return undefined;
    }
    const firstTrace = agentTraces[0];
    const lastTrace = agentTraces[agentTraces.length - 1];
    if (firstTrace === undefined || lastTrace === undefined) {
      return undefined;
    }
    return { startTime: firstTrace.createdAt, endTime: lastTrace.createdAt };
  }, [agentTraces]);
  const loadingPriceLineItems = (priceLineItemState.agents.getItem(agentId)?.status ?? 'loading') === 'loading';

  const setViewModeFromValue = (value: string) => {
    const next = parseAgentDetailViewMode(value);
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (next === 'chat') {
          updated.delete('view');
        } else {
          updated.set('view', next);
        }
        return updated;
      },
      { replace: true },
    );
  };

  const openModelCall = (modelCallId: string) => {
    navigate(`/agents/${agentId}/model-calls/${modelCallId}`);
  };

  const openAgent = (targetAgentId: string) => {
    navigate(`/agents/${targetAgentId}`);
  };

  const openAgentRegistry = (registryId: string) => {
    navigate(`/configuration/agent-registries/${registryId}`);
  };

  const openThreadSnapshot = (threadCursor: string) => {
    const path = threadSnapshotPath(threadCursor);

    if (path !== null) {
      navigate(path);
    }
  };

  const openWorktreeOnDisk = useOpenWorktree();
  const openWorktree = (worktreeId: string) => {
    void openWorktreeOnDisk({ id: worktreeId });
  };

  const openTask = (boardId: string, taskId: string) => {
    navigate(`/tasks/${boardId}?selectedTask=${taskId}`);
  };

  const sendChatMessage = async (input: { markdown: string; cells: CellContent[] }) => {
    const trimmed = input.markdown.trim();
    if ((trimmed.length === 0 && input.cells.length === 0) || agentId.length === 0) {
      return;
    }
    setChatSending(true);
    setChatError('');
    try {
      await sendAgentMessage({ agentId, message: trimmed, cells: input.cells });
    } catch (failure) {
      setChatError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setChatSending(false);
    }
  };

  const stopAgentRun = async () => {
    if (agentId.length === 0) {
      return;
    }
    setStopping(true);
    setChatError('');
    try {
      await stopAgent({ agentId, reason: 'user stop from chat' });
    } catch (failure) {
      setChatError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setStopping(false);
    }
  };

  const freshStartAgentRun = async () => {
    if (agentId.length === 0) {
      return;
    }
    setRestarting(true);
    setChatError('');
    try {
      await freshStartAgent({ agentId });
    } catch (failure) {
      setChatError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setRestarting(false);
    }
  };

  return {
    agent,
    agentId,
    agentTraces,
    chatError,
    chatSending,
    loadingPriceLineItems,
    openAgent,
    openAgentRegistry,
    openModelCall,
    openTask,
    openThreadSnapshot,
    openWorktree,
    priceLineItems,
    traceTimeRange,
    redirectToAgents: agentId.length === 0,
    sendChatMessage,
    stopAgentRun,
    stopping,
    freshStartAgentRun,
    restarting,
    liveness,
    setViewModeFromValue,
    setWaterfallScope,
    traces,
    viewMode,
    waterfallScope,
    waterfallItems,
    waitingReasons,
  };
}

function readDescendantAgentIds(agentId: string, agents: AgentRecord[]) {
  const childrenByParentId = new Map<string, string[]>();
  for (const agent of agents) {
    if (!agent.parentAgentId) {
      continue;
    }
    childrenByParentId.set(agent.parentAgentId, [...(childrenByParentId.get(agent.parentAgentId) ?? []), agent.id]);
  }

  const descendants: string[] = [];
  const pending = [...(childrenByParentId.get(agentId) ?? [])];
  while (pending.length > 0) {
    const childId = pending.shift();
    if (childId === undefined || descendants.includes(childId)) {
      continue;
    }
    descendants.push(childId);
    pending.push(...(childrenByParentId.get(childId) ?? []));
  }
  return descendants;
}
