import type { AutomationRecord, Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { HeartbeatService } from '../heartbeat-service';
import { AutomationHeartbeatListener } from './automation-heartbeat-listener';

export interface AutomationServiceInput {
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  datastore: Datastore;
  heartbeat: HeartbeatService;
  logger: Logger;
}

export class AutomationService {
  private readonly agentRegistry: AgentRegistryService;
  private readonly bridge: DaemonBridge;
  private readonly datastore: Datastore;
  private readonly heartbeat: HeartbeatService;
  private readonly logger: Logger;

  public constructor(input: AutomationServiceInput) {
    this.agentRegistry = input.agentRegistry;
    this.bridge = input.bridge;
    this.datastore = input.datastore;
    this.heartbeat = input.heartbeat;
    this.logger = input.logger;
  }

  public async hydrate(): Promise<void> {
    const { items } = await this.datastore.automations.list({ limit: 1000, offset: 0 });
    for (const automation of items) {
      this.register(automation);
    }
    this.logger.info('automations hydrated', { count: items.length });
  }

  public register(automation: AutomationRecord): void {
    this.heartbeat.register(
      new AutomationHeartbeatListener({
        automationId: automation.id,
        datastore: this.datastore,
        fire: (automationId, now) => this.fireAutomation(automationId, now),
      }),
    );
  }

  public unregister(automationId: string): void {
    this.heartbeat.unregister(`automation:${automationId}`);
  }

  public async runNow(automationId: string): Promise<{ agentId: string }> {
    return this.fireAutomation(automationId, Date.now());
  }

  private async fireAutomation(automationId: string, now: number): Promise<{ agentId: string }> {
    const row = await this.datastore.automations.read({ id: automationId });
    if (row === null) {
      throw new Error(`Automation not found: ${automationId}`);
    }
    const launched = await this.agentRegistry.launch({
      agentRegistryId: row.agentRegistryId,
      message: row.message,
    });
    const updated = await this.datastore.automations.recordRun({ id: automationId, ranAt: now });
    this.bridge.emit('automationUpdated', updated);
    return { agentId: launched.id };
  }
}
