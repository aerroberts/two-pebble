import type { Datastore } from '@two-pebble/datastore';
import type { HeartbeatListener, HeartbeatReportDetail } from '../heartbeat-service';

export interface AutomationHeartbeatListenerInput {
  automationId: string;
  datastore: Datastore;
  fire: (automationId: string, now: number) => Promise<{ agentId: string }>;
}

export class AutomationHeartbeatListener implements HeartbeatListener {
  public readonly id: string;
  public readonly kind = 'automation' as const;
  private readonly automationId: string;
  private readonly datastore: Datastore;
  private readonly fire: (automationId: string, now: number) => Promise<{ agentId: string }>;

  public constructor(input: AutomationHeartbeatListenerInput) {
    this.automationId = input.automationId;
    this.datastore = input.datastore;
    this.fire = input.fire;
    this.id = `automation:${input.automationId}`;
  }

  public async onHeartbeat(now: number): Promise<HeartbeatReportDetail> {
    const row = await this.datastore.automations.read({ id: this.automationId });
    if (row === null) {
      return { outcome: 'skipped', detail: { reason: 'deleted' } };
    }
    if (!row.enabled) {
      return { outcome: 'skipped', detail: { reason: 'disabled' } };
    }
    if (row.intervalUnit === 'manual') {
      return { outcome: 'skipped', detail: { reason: 'manual' } };
    }
    const intervalMs = intervalToMs(row.intervalUnit, row.intervalValue);
    if (intervalMs <= 0) {
      return { outcome: 'skipped', detail: { reason: 'invalid-interval' } };
    }
    const baseline = row.lastRanAt ?? row.createdAt;
    const nextDueAt = baseline + intervalMs;
    if (now < nextDueAt) {
      return { outcome: 'skipped', detail: { reason: 'not-due', nextDueAt } };
    }
    const launched = await this.fire(this.automationId, now);
    return { outcome: 'fired', detail: { agentId: launched.agentId } };
  }
}

function intervalToMs(unit: 'minutes' | 'hours' | 'days', value: number): number {
  const multiplier = unit === 'minutes' ? 60_000 : unit === 'hours' ? 3_600_000 : 86_400_000;
  return value * multiplier;
}
