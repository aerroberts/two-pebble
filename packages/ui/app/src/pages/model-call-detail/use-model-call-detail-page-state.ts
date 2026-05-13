import type {
  AgentCallRecord,
  AgentCallRegistryRecord,
  AgentPriceLineItemRecord,
  LoadableRegistry,
} from '@two-pebble/realtime';
import { useAgentCalls, useAgentPriceLineItems, useReadAgentCall } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { threadSnapshotPath } from '../../shared/routing/thread-pointer';
import { type ModelCallData, readModelCallData } from './model-call-data';
import { type ModelCallViewMode, parseModelCallViewMode } from './model-call-detail.types';

export interface ModelCallDetailPageState {
  calls: LoadableRegistry<AgentCallRegistryRecord>;
  modelCallData: ModelCallData | null;
  openThreadSnapshot(pointer: string): void;
  priceLineItems: AgentPriceLineItemRecord[];
  priceLineItemsLoading: boolean;
  redirectToAgents: boolean;
  setViewModeFromValue(value: string): void;
  threadPointer: string;
  viewMode: ModelCallViewMode;
  visibleCall: AgentCallRegistryRecord | null;
}

type VisibleAgentCallRecord = AgentCallRecord | null;

export function useModelCallDetailPageState(): ModelCallDetailPageState {
  const params = useParams();
  const agentId = params.agentId ?? '';
  const modelCallId = params.modelCallId ?? '';
  const calls = useAgentCalls({ agentId });
  const priceLineItemState = useAgentPriceLineItems({ agentId });
  const readAgentCall = useReadAgentCall();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ModelCallViewMode>('overview');
  const callItem = calls.getItem(modelCallId);
  const visibleCall = callItem?.value ?? null;
  const visibleCallRecord = visibleCall === null ? null : readVisibleAgentCallRecord(visibleCall);
  const modelCallData = visibleCallRecord === null ? null : readModelCallData(visibleCallRecord.data);
  const priceLineItemStatus = priceLineItemState.agents.getItem(agentId)?.status ?? 'loading';
  const threadPointer = visibleCall?.threadCellPointer ?? modelCallData?.thread ?? '';

  const openThreadSnapshot = (pointer: string) => {
    const path = threadSnapshotPath(pointer);

    if (path !== null) {
      navigate(path);
    }
  };

  const setViewModeFromValue = (value: string) => {
    setViewMode(parseModelCallViewMode(value));
  };

  useEffect(() => {
    if (modelCallId.length === 0 || visibleCallRecord !== null || callItem?.status === 'loading') {
      return;
    }

    void readAgentCall({ id: modelCallId }).catch(() => undefined);
  }, [callItem?.status, modelCallId, readAgentCall, visibleCallRecord]);

  return {
    calls,
    modelCallData,
    openThreadSnapshot,
    priceLineItems: priceLineItemState.lineItems.values().filter((lineItem) => lineItem.modelCallId === modelCallId),
    priceLineItemsLoading: modelCallId.length > 0 && priceLineItemStatus === 'loading',
    redirectToAgents: agentId.length === 0 || modelCallId.length === 0,
    setViewModeFromValue,
    threadPointer,
    viewMode,
    visibleCall,
  };
}

function readVisibleAgentCallRecord(call: AgentCallRegistryRecord): VisibleAgentCallRecord {
  if (!('data' in call) || call.data === null || typeof call.data !== 'object' || Array.isArray(call.data)) {
    return null;
  }

  return call as AgentCallRecord;
}
