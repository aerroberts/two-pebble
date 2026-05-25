import type { AgentSignalRecord, Datastore } from '@two-pebble/datastore';
import type { PebbleJsonRecord } from '@two-pebble/pebble';
import type { AgentRegistryService } from './service';

interface RepairBlockedSubAgentResultSignalsInput {
  agentId: string;
  datastore: Datastore;
}

interface RepairBlockedSubAgentResultSignalsForAgentsInput {
  agentRegistry: AgentRegistryService;
  datastore: Datastore;
}

/**
 * Converts child result push signals into the matching open fan-in waits.
 * This lets a cold parent resume once every waited-on child has responded.
 */
export async function repairBlockedSubAgentResultSignals(
  input: RepairBlockedSubAgentResultSignalsInput,
): Promise<boolean> {
  const received = await input.datastore.agent.signals.listReceivedForAgent({ agentId: input.agentId });
  return repairBlockedSubAgentResultSignal({ ...input, received: received.items });
}

async function repairBlockedSubAgentResultSignal(
  input: RepairBlockedSubAgentResultSignalsInput & { received: AgentSignalRecord[] },
): Promise<boolean> {
  const results = input.received.filter(isBlockedSubAgentResult);
  if (results.length === 0) {
    return false;
  }
  const open = await input.datastore.agent.signals.listOpenForAgent({ agentId: input.agentId });
  const usedSignalIds = new Set<string>();
  let repaired = false;
  for (const result of results) {
    const childName = signalString(result, 'childName');
    const childAgentId = signalString(result, 'childAgentId');
    if (childName === undefined && childAgentId === undefined) {
      continue;
    }
    const wait = open.items.find(
      (signal) => !usedSignalIds.has(signal.signalId) && isOpenSubAgentWait(signal, childName, childAgentId),
    );
    if (wait === undefined) {
      continue;
    }
    usedSignalIds.add(wait.signalId);
    await input.datastore.agent.signals.resolve({
      agentId: input.agentId,
      capabilityId: wait.capabilityId,
      data: result.data,
      signalId: wait.signalId,
    });
    await input.datastore.agent.signals.markResolved({ id: result.id });
    repaired = true;
  }
  return repaired;
}

export async function repairBlockedSubAgentResultSignalsForAgents(
  input: RepairBlockedSubAgentResultSignalsForAgentsInput,
): Promise<void> {
  const { items } = await input.datastore.agent.list({ limit: 1000, offset: 0 });
  for (const record of items) {
    if (record.status !== 'waiting' && record.status !== 'idle') {
      continue;
    }
    const repaired = await repairBlockedSubAgentResultSignals({ agentId: record.id, datastore: input.datastore });
    if (repaired) {
      await input.agentRegistry.wakeIfSignalsReady(record.id);
    }
  }
}

function isBlockedSubAgentResult(signal: AgentSignalRecord): boolean {
  return (
    signal.capabilityId === 'sub-agent' &&
    signal.kind === 'push' &&
    signal.status === 'received' &&
    signalString(signal, 'type') === 'sub-agent-result'
  );
}

function isOpenSubAgentWait(
  signal: AgentSignalRecord,
  childName: string | undefined,
  childAgentId: string | undefined,
): boolean {
  if (
    signal.capabilityId !== 'sub-agent' ||
    signal.kind !== 'awaited' ||
    signal.name !== 'Sub-agent result' ||
    signal.status !== 'open'
  ) {
    return false;
  }
  return (
    (childName !== undefined && signal.description.includes(`sub-agent ${childName} `)) ||
    (childAgentId !== undefined && signal.description.includes(`(${childAgentId})`))
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
