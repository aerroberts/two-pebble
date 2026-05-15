import type { Datastore } from '@two-pebble/datastore';
import type { AgentNamingRunner } from '@two-pebble/pebble';
import type { DaemonBridge } from '../../types';

interface DaemonAgentNamingRunnerInput {
  agentId: string;
  datastore: Datastore;
  multicastBridge: DaemonBridge;
}

/**
 * Daemon-side implementation of the Pebble `AgentNamingRunner`.
 *
 * Persists the new name through the same `datastore.agent.rename`
 * operation the CLI `renameAgent` handler uses, then broadcasts the
 * updated record so subscribers (the UI sidebar, agent list) see the
 * change in real time.
 */
export class DaemonAgentNamingRunner implements AgentNamingRunner {
  private readonly agentId: string;
  private readonly datastore: Datastore;
  private readonly multicastBridge: DaemonBridge;

  public constructor(input: DaemonAgentNamingRunnerInput) {
    this.agentId = input.agentId;
    this.datastore = input.datastore;
    this.multicastBridge = input.multicastBridge;
  }

  public async setName(name: string): Promise<void> {
    const record = await this.datastore.agent.rename({ id: this.agentId, name });
    this.multicastBridge.emit('agentRecorded', {
      agentRegistryId: record.agentRegistryId ?? null,
      completedAt: record.completedAt,
      description: record.description,
      id: record.id,
      metadata: record.metadata,
      name: record.name,
      parentAgentId: record.parentAgentId ?? null,
      startedAt: record.startedAt,
      status: record.status,
    });
  }
}
