import type { Datastore, HeartbeatRecord, HeartbeatReport } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { DaemonBridge } from '../../types';
import type { HeartbeatListener, HeartbeatReportDetail } from './heartbeat-listener';
import { HEARTBEAT_LISTENER_TIMEOUT_MS, HEARTBEAT_RETENTION, HEARTBEAT_TICK_MS } from './heartbeat-service-constants';

type HeartbeatTimer = ReturnType<typeof setInterval>;

export class HeartbeatService {
  private readonly bridge: DaemonBridge;
  private readonly datastore: Datastore;
  private readonly listeners = new Map<string, HeartbeatListener>();
  private readonly logger: Logger;
  private timer: HeartbeatTimer | undefined;
  private tickInflight = false;

  public constructor(input: { bridge: DaemonBridge; datastore: Datastore; logger: Logger }) {
    this.bridge = input.bridge;
    this.datastore = input.datastore;
    this.logger = input.logger;
  }

  public start(): void {
    if (this.timer !== undefined) {
      return;
    }
    this.timer = setInterval(() => {
      void this.tick();
    }, HEARTBEAT_TICK_MS);
  }

  public stop(): void {
    if (this.timer === undefined) {
      return;
    }
    clearInterval(this.timer);
    this.timer = undefined;
  }

  public register(listener: HeartbeatListener): void {
    if (this.listeners.has(listener.id)) {
      throw new Error(`Heartbeat listener already registered: ${listener.id}`);
    }
    this.listeners.set(listener.id, listener);
  }

  public unregister(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  public list(): readonly HeartbeatListener[] {
    return [...this.listeners.values()];
  }

  public async tick(now = Date.now()): Promise<HeartbeatRecord | null> {
    if (this.tickInflight) {
      return null;
    }
    this.tickInflight = true;
    try {
      const startedAt = Date.now();
      const snapshot = [...this.listeners.values()];
      const settled = await Promise.allSettled(snapshot.map((listener) => this.runOne(listener, now)));
      const reports = settled.map((result, index): HeartbeatReport => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        const listener = snapshot[index];
        const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
        return {
          listenerId: listener.id,
          kind: listener.kind,
          outcome: 'error',
          detail: { error: message },
        };
      });
      const record = await this.datastore.heartbeats.insert({
        durationMs: Date.now() - startedAt,
        listenerCount: snapshot.length,
        reports,
        tickAt: now,
      });
      this.bridge.emit('heartbeatRecorded', record);
      await this.datastore.heartbeats.prune({ retain: HEARTBEAT_RETENTION });
      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn('heartbeat tick failed', { error: message });
      return null;
    } finally {
      this.tickInflight = false;
    }
  }

  private async runOne(listener: HeartbeatListener, now: number): Promise<HeartbeatReport> {
    try {
      const report = await this.withTimeout(listener.onHeartbeat(now));
      return this.toReport(listener, report);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        listenerId: listener.id,
        kind: listener.kind,
        outcome: 'error',
        detail: { error: message },
      };
    }
  }

  private async withTimeout(promise: Promise<HeartbeatReportDetail>): Promise<HeartbeatReportDetail> {
    return Promise.race([
      promise,
      new Promise<HeartbeatReportDetail>((_, reject) => {
        setTimeout(() => reject(new Error('heartbeat listener timed out')), HEARTBEAT_LISTENER_TIMEOUT_MS);
      }),
    ]);
  }

  private toReport(listener: HeartbeatListener, detail: HeartbeatReportDetail): HeartbeatReport {
    return {
      listenerId: listener.id,
      kind: listener.kind,
      outcome: detail.outcome,
      detail: detail.detail ?? {},
    };
  }
}
