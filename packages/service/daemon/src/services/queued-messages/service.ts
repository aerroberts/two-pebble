import { logger } from '@two-pebble/logger';
import type { AgentRegistryService } from '../agent-registry/service';
import { DaemonService } from '../daemon-service';

/**
 * Delivers durable queued user messages to agents as they become idle.
 */
export class QueuedMessagesDispatcherService extends DaemonService {
  public readonly id = 'queued-messages-dispatcher';
  private readonly dispatching = new Set<string>();
  private unsubscribeStatusPersisted?: () => void;

  private get agentRegistry(): AgentRegistryService {
    return this.daemon.requireService<AgentRegistryService>('agent-registry');
  }

  private get qm() {
    return this.daemon.datastore.agent.queuedMessages;
  }

  public override async initialize(): Promise<void> {
    const agentIds = await this.qm.listIdleAgentsWithWork();
    for (const agentId of agentIds) {
      void this.tryDispatch(agentId);
    }
    this.unsubscribeStatusPersisted = this.agentRegistry.onStatusPersisted((agentId, status) => {
      if (status === 'idle') {
        void this.tryDispatch(agentId);
      }
    });
  }

  public override shutdown(): void {
    this.unsubscribeStatusPersisted?.();
  }

  public async tryDispatch(agentId: string): Promise<void> {
    if (this.dispatching.has(agentId)) {
      return;
    }
    this.dispatching.add(agentId);
    try {
      const agent = await this.daemon.datastore.agent.read({ id: agentId });
      if (agent.status !== 'idle') {
        return;
      }
      const row = await this.qm.peekNext({ agentId });
      if (row === null) {
        return;
      }
      try {
        const runtime = await this.agentRegistry.rehydrate(agentId);
        runtime.sendMessage(row.cells);
        this.daemon.events.emit('agentQueuedMessageChanged', await this.qm.markSent({ id: row.id }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('queued agent message dispatch failed', { agentId, queuedMessageId: row.id, error: message });
        this.daemon.events.emit('agentQueuedMessageChanged', await this.qm.markFailed({ id: row.id, error: message }));
      }
    } finally {
      this.dispatching.delete(agentId);
    }
  }
}
