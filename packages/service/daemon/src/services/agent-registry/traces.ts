import type { Datastore } from '@two-pebble/datastore';
import { ensureSubAgent, type SubAgentCreatePromiseMap } from './sub-agents';
import type { RecordTraceInput } from './types';

interface RecordAgentTraceInput extends RecordTraceInput {
  datastore: Datastore;
  pending: SubAgentCreatePromiseMap;
}

export async function recordAgentTrace(input: RecordAgentTraceInput): Promise<void> {
  if (input.trace.type === 'sub-agent-invoke') {
    await ensureSubAgent(
      { datastore: input.datastore, pending: input.pending },
      {
        events: input.events,
        event: {
          agentInstanceId: input.trace.data.agentInstanceId,
          agentTemplateId: input.trace.data.agentTemplateId,
        },
        parentAgentId: input.agentId,
        workspaceId: input.workspaceId,
      },
    );
  }
  const record = await input.datastore.agent.traces.record({
    ...input.trace,
    agentId: input.agentId,
    id: crypto.randomUUID(),
    orderId: input.orderId,
  });
  input.events.emit('agentTraceRecorded', record);
}
