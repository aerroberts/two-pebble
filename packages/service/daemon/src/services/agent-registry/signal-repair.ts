import type { AgentSignalRecord, Datastore } from '@two-pebble/datastore';
import type { PebbleJsonRecord } from '@two-pebble/pebble';
import type { AgentRegistryService } from './service';

interface RepairBlockedSubAgentAskSignalInput {
  agentId: string;
  datastore: Datastore;
}

interface RepairBlockedSubAgentAskSignalsInput {
  agentRegistry: AgentRegistryService;
  datastore: Datastore;
}

/**
 * Repairs rows written by the previous sub-agent ask path.
 *
 * Old child asks were sent as push signals while the parent still had an
 * open awaited child-response signal. Converting that push into the open
 * awaited signal lets the normal parent ask flow resume.
 */
export async function repairBlockedSubAgentAskSignal(input: RepairBlockedSubAgentAskSignalInput): Promise<boolean> {
  const received = await input.datastore.agent.signals.listReceivedForAgent({ agentId: input.agentId });
  const ask = received.items.find(isBlockedSubAgentAsk);
  if (ask === undefined) {
    return false;
  }
  const childAgentId = signalString(ask, 'childAgentId');
  if (childAgentId === undefined) {
    return false;
  }
  const open = await input.datastore.agent.signals.listOpenForAgent({ agentId: input.agentId });
  const response = open.items.find((signal) => isOpenSubAgentResponse(signal, childAgentId));
  if (response === undefined) {
    return false;
  }
  await input.datastore.agent.signals.resolve({
    agentId: input.agentId,
    capabilityId: response.capabilityId,
    data: ask.data,
    signalId: response.signalId,
  });
  await input.datastore.agent.signals.markResolved({ id: ask.id });
  return true;
}

export async function repairBlockedSubAgentAskSignals(input: RepairBlockedSubAgentAskSignalsInput): Promise<void> {
  const { items } = await input.datastore.agent.list({ limit: 1000, offset: 0 });
  for (const record of items) {
    if (record.status !== 'waiting' && record.status !== 'idle') {
      continue;
    }
    const repaired = await repairBlockedSubAgentAskSignal({ agentId: record.id, datastore: input.datastore });
    if (repaired) {
      await input.agentRegistry.wakeIfSignalsReady(record.id);
    }
  }
}

function isBlockedSubAgentAsk(signal: AgentSignalRecord): boolean {
  return (
    signal.capabilityId === 'sub-agent' &&
    signal.kind === 'push' &&
    signal.status === 'received' &&
    signalString(signal, 'type') === 'ask-parent'
  );
}

function isOpenSubAgentResponse(signal: AgentSignalRecord, childAgentId: string): boolean {
  return (
    signal.capabilityId === 'sub-agent' &&
    signal.kind === 'awaited' &&
    signal.name === 'Sub-agent response' &&
    signal.status === 'open' &&
    signal.description.includes(childAgentId)
  );
}

function signalString(signal: AgentSignalRecord, key: string): string | undefined {
  const value = signalData(signal)[key];
  return typeof value === 'string' ? value : undefined;
}

function signalData(signal: AgentSignalRecord): PebbleJsonRecord {
  if (signal.data === null || typeof signal.data !== 'object' || Array.isArray(signal.data)) {
    return {};
  }
  return signal.data as PebbleJsonRecord;
}
