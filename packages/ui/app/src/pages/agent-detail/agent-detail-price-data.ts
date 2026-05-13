import type { AgentCallSummaryRecord, AgentPriceLineItemRecord } from '@two-pebble/realtime';

type AgentCallSummaries = AgentCallSummaryRecord[];
type AgentCallSummaryMap = Map<string, AgentCallSummaryRecord>;
type AgentPriceLineItemRecords = AgentPriceLineItemRecord[];

export interface AgentPriceLineItem {
  id: string;
  modelCallId: string | null;
  inferenceProfileId?: string;
  integrationId?: string;
  provider: string;
  modelId: string;
  modelVariantId?: string;
  charge: string;
  price: number;
  quantity: number;
  timestamp?: number;
  total: number;
}

export function readAgentPriceLineItems(
  agentId: string,
  summaries: AgentCallSummaries,
  lineItems: AgentPriceLineItemRecords,
) {
  const summaryById = new Map(summaries.map((summary) => [summary.id, summary]));
  return lineItems
    .filter((lineItem) => lineItem.agentId === agentId)
    .map((lineItem) => readAgentPriceLineItem(lineItem, summaryById));
}

function readAgentPriceLineItem(
  lineItem: AgentPriceLineItemRecord,
  summaryById: AgentCallSummaryMap,
): AgentPriceLineItem {
  const summary = lineItem.modelCallId === null ? undefined : summaryById.get(lineItem.modelCallId);
  return {
    id: lineItem.id,
    modelCallId: lineItem.modelCallId,
    ...(lineItem.inferenceProfileId === undefined ? {} : { inferenceProfileId: lineItem.inferenceProfileId }),
    ...(lineItem.integrationId === undefined ? {} : { integrationId: lineItem.integrationId }),
    provider: lineItem.provider || summary?.provider || '',
    modelId: lineItem.modelId || summary?.modelId || '',
    ...(lineItem.modelVariantId === undefined ? {} : { modelVariantId: lineItem.modelVariantId }),
    charge: lineItem.charge,
    price: lineItem.price,
    quantity: lineItem.quantity,
    ...(lineItem.timestamp === undefined ? {} : { timestamp: lineItem.timestamp }),
    total: lineItem.total,
  };
}
