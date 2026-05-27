import type { AutomationRecord } from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import type { DaemonHeartbeatInput, DaemonHeartbeatReport } from '../../types';
import type { AgentRegistryService } from '../agent-registry/service';
import { DaemonService } from '../daemon-service';

export class AutomationService extends DaemonService {
  public readonly id = 'automation';

  private get agentRegistry(): AgentRegistryService {
    return this.daemon.requireService<AgentRegistryService>('agent-registry');
  }

  private get datastore() {
    return this.daemon.datastore;
  }

  public override async initialize(): Promise<void> {
    const { items } = await this.datastore.automations.list({ limit: 1000, offset: 0 });
    logger.info('automations initialized', { count: items.length });
  }

  public register(_automation: AutomationRecord): void {}

  public unregister(_automationId: string): void {}

  public async runNow(automationId: string): Promise<{ agentId: string }> {
    return this.fireAutomation(automationId, Date.now());
  }

  public override async onHeartbeat(input: DaemonHeartbeatInput): Promise<DaemonHeartbeatReport> {
    const { items } = await this.datastore.automations.list({ limit: 1000, offset: 0 });
    let fired = 0;
    let skipped = 0;
    for (const automation of items) {
      const result = await this.maybeFireAutomation(automation, input.now);
      if (result.outcome === 'fired') {
        fired += 1;
      } else {
        skipped += 1;
      }
    }
    return { outcome: fired > 0 ? 'fired' : 'skipped', detail: { fired, skipped, count: items.length } };
  }

  private async maybeFireAutomation(automation: AutomationRecord, now: number): Promise<DaemonHeartbeatReport> {
    if (!automation.enabled) {
      return { outcome: 'skipped', detail: { reason: 'disabled' } };
    }
    if (automation.intervalUnit === 'manual') {
      return { outcome: 'skipped', detail: { reason: 'manual' } };
    }
    const intervalMs = intervalToMs(automation.intervalUnit, automation.intervalValue);
    if (intervalMs <= 0) {
      return { outcome: 'skipped', detail: { reason: 'invalid-interval' } };
    }
    const baseline = automation.lastRanAt ?? automation.createdAt;
    const nextDueAt = baseline + intervalMs;
    if (now < nextDueAt) {
      return { outcome: 'skipped', detail: { reason: 'not-due', nextDueAt } };
    }
    const launched = await this.fireAutomationIfAttached(automation.id, now);
    if (launched === null) {
      return { outcome: 'skipped', detail: { reason: 'detached' } };
    }
    return { outcome: 'fired', detail: { agentId: launched.agentId } };
  }

  private async fireAutomationIfAttached(automationId: string, now: number): Promise<{ agentId: string } | null> {
    try {
      return await this.fireAutomation(automationId, now);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Agent registry not found:')) {
        logger.warn('automation skipped because registry is detached', { automationId });
        return null;
      }
      throw error;
    }
  }

  private async fireAutomation(automationId: string, now: number): Promise<{ agentId: string }> {
    const row = await this.datastore.automations.read({ id: automationId });
    if (row === null) {
      throw new Error(`Automation not found: ${automationId}`);
    }
    const registry = await this.datastore.agentRegistries.read({ id: row.agentRegistryId });
    const launched = await this.agentRegistry.launch({
      agentRegistryId: row.agentRegistryId,
      message: row.message,
      projectId: registry.projectId,
    });
    const updated = await this.datastore.automations.recordRun({ id: automationId, ranAt: now });
    this.daemon.events.emit('automationUpdated', updated);
    return { agentId: launched.id };
  }
}

function intervalToMs(unit: 'minutes' | 'hours' | 'days', value: number): number {
  const multiplier = unit === 'minutes' ? 60_000 : unit === 'hours' ? 3_600_000 : 86_400_000;
  return value * multiplier;
}
