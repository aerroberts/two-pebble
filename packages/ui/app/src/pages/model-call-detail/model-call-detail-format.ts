import type { AgentCallRecord, AgentCallSummaryRecord } from '@two-pebble/realtime';

export function getModelCallDurationEnd(call: AgentCallRecord | AgentCallSummaryRecord) {
  return call.completedAt > 0 ? call.completedAt : undefined;
}

export function formatUsd(value: number) {
  return value.toLocaleString('en-US', {
    currency: 'USD',
    maximumFractionDigits: 8,
    minimumFractionDigits: 2,
    style: 'currency',
  });
}
