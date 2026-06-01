import type { HeartbeatRecord, HeartbeatReport } from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import type { DaemonHeartbeatReport } from '../../types';
import { DaemonService } from '../daemon-service';
import { HEARTBEAT_LISTENER_TIMEOUT_MS, HEARTBEAT_RETENTION, HEARTBEAT_TICK_MS } from './constants';
import type { HeartbeatTimer } from './types';

/**
 * Daemon service that drives the periodic heartbeat. It owns the interval
 * timer, ticks every `HEARTBEAT_TICK_MS`, and records each report while
 * pruning entries past the retention window.
 */
export class HeartbeatService extends DaemonService {
  public readonly id = 'heartbeat';
  private timer: HeartbeatTimer | undefined;
  private tickInflight = false;

  public override initialize(): void {
    if (this.timer !== undefined) {
      return;
    }
    this.timer = setInterval(() => {
      void this.tick();
    }, HEARTBEAT_TICK_MS);
  }

  public override shutdown(): void {
    if (this.timer === undefined) {
      return;
    }
    clearInterval(this.timer);
    this.timer = undefined;
  }

  public async tick(now = Date.now()): Promise<HeartbeatRecord | null> {
    if (this.tickInflight) {
      return null;
    }
    this.tickInflight = true;
    try {
      const startedAt = Date.now();
      const snapshot = this.daemon.services.filter((service) => service !== this);
      const settled = await Promise.allSettled(snapshot.map((service) => this.runOne(service, now)));
      const reports = settled.flatMap((result, index): HeartbeatReport[] => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        const service = snapshot[index];
        const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
        return [
          {
            listenerId: service.id,
            kind: service.id,
            outcome: 'error',
            detail: { error: message },
          },
        ];
      });
      const record = await this.daemon.datastore.heartbeats.insert({
        durationMs: Date.now() - startedAt,
        listenerCount: snapshot.length,
        reports,
        tickAt: now,
      });
      this.daemon.events.emit('heartbeatRecorded', record);
      await this.daemon.datastore.heartbeats.prune({ retain: HEARTBEAT_RETENTION });
      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('heartbeat tick failed', { error: message });
      return null;
    } finally {
      this.tickInflight = false;
    }
  }

  private async runOne(service: DaemonService, now: number): Promise<HeartbeatReport[]> {
    try {
      const report = await this.withTimeout(
        Promise.resolve(service.onHeartbeat({ now })).then(
          (value): DaemonHeartbeatReport | DaemonHeartbeatReport[] | undefined => value ?? undefined,
        ),
      );
      return this.toReports(service, report);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [
        {
          listenerId: service.id,
          kind: service.id,
          outcome: 'error',
          detail: { error: message },
        },
      ];
    }
  }

  private async withTimeout(
    promise: Promise<DaemonHeartbeatReport | DaemonHeartbeatReport[] | undefined>,
  ): Promise<DaemonHeartbeatReport | DaemonHeartbeatReport[] | undefined> {
    return Promise.race([
      promise,
      new Promise<DaemonHeartbeatReport>((_, reject) => {
        setTimeout(() => reject(new Error('heartbeat service timed out')), HEARTBEAT_LISTENER_TIMEOUT_MS);
      }),
    ]);
  }

  /**
   * Normalizes a service's heartbeat output into recorded reports. A service
   * may return nothing, a single report, or one report per logical entity;
   * each report can override its listenerId/kind, defaulting to the service id.
   */
  private toReports(
    service: DaemonService,
    report: DaemonHeartbeatReport | DaemonHeartbeatReport[] | undefined,
  ): HeartbeatReport[] {
    if (report === undefined) {
      return [{ listenerId: service.id, kind: service.id, outcome: 'skipped', detail: {} }];
    }
    const entries = Array.isArray(report) ? report : [report];
    return entries.map((entry) => ({
      listenerId: entry.listenerId ?? service.id,
      kind: entry.kind ?? service.id,
      outcome: entry.outcome,
      detail: entry.detail ?? {},
    }));
  }
}
