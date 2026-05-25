import { logger } from '@two-pebble/logger';
import type { Agent, ProbeResult } from '@two-pebble/pebble';
import type { AgentRegistryService } from '../agent-registry/service';
import { DaemonService, type DaemonServiceHost } from '../daemon-service';
import { PROBE_TIMEOUT_MS, TICK_MS } from './constants';
import { deriveActiveState } from './state';
import type { LivenessTimer, ProbeableAgent } from './types';

/**
 * Reconciles durable agent status with the hot runtime registry. Running
 * rows must have a live runtime object; otherwise they are interrupted.
 * Hot running agents get periodic liveness broadcasts for the UI.
 */
export class LivenessService extends DaemonService {
  public readonly id = 'liveness';
  private readonly daemonBootId: string;
  private timer: LivenessTimer | undefined;
  private tickInflight = false;

  public constructor(daemon: DaemonServiceHost, input: { daemonBootId: string }) {
    super(daemon);
    this.daemonBootId = input.daemonBootId;
  }

  private get agentRegistry(): AgentRegistryService {
    return this.daemon.requireService<AgentRegistryService>('agent-registry');
  }

  private get datastore() {
    return this.daemon.datastore;
  }

  /**
   * Starts the periodic reconcile loop. Idempotent — calling start twice
   * does not stack timers. Caller is responsible for matching with stop().
   */
  public override initialize(): void {
    if (this.timer !== undefined) {
      return;
    }
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
  }

  /**
   * Stops the reconcile loop. Pending probes already started this tick are
   * allowed to finish but no further ticks will be scheduled.
   */
  public override shutdown(): void {
    if (this.timer === undefined) {
      return;
    }
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private async tick(): Promise<void> {
    if (this.tickInflight) {
      return;
    }
    this.tickInflight = true;
    try {
      await this.reconcile();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('liveness service tick failed', { error: message });
    } finally {
      this.tickInflight = false;
    }
  }

  private async reconcile(): Promise<void> {
    const { items } = await this.datastore.agent.list({ limit: 1000, offset: 0 });
    const now = Date.now();
    for (const record of items) {
      if (
        record.status !== 'running' &&
        record.status !== 'waiting' &&
        record.status !== 'idle' &&
        record.status !== 'interrupted' &&
        record.status !== 'offline'
      ) {
        continue;
      }
      const active = this.agentRegistry.get(record.id);
      if (active !== undefined) {
        if (record.status === 'running') {
          await this.broadcastActive(record.id, active, now);
        }
        continue;
      }
      if (record.status === 'idle' || record.status === 'offline') {
        continue;
      }
      if (record.status === 'waiting' || record.status === 'interrupted') {
        continue;
      }
      await this.agentRegistry.interrupt(record.id, 'running status without active runtime');
    }
  }

  private async broadcastActive(agentId: string, agent: Agent, now: number): Promise<void> {
    const probe = await this.probeWithTimeout(agent);
    const state = deriveActiveState(probe, now);
    this.daemon.events.emit('agentLiveness', {
      agentId,
      daemonBootId: this.daemonBootId,
      state,
      lastActivityAt: probe.lastActivityAt,
      hint: probe.hint,
    });
  }

  private async probeWithTimeout(agent: Agent): Promise<ProbeResult> {
    if (!('probe' in agent) || typeof agent.probe !== 'function') {
      return { alive: true, lastActivityAt: 0, hint: 'probe-unavailable' };
    }
    return new Promise<ProbeResult>((resolve) => {
      const timer = setTimeout(() => {
        resolve({ alive: true, lastActivityAt: 0, hint: 'probe-timeout' });
      }, PROBE_TIMEOUT_MS);
      (agent as Agent & ProbeableAgent)
        .probe()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          const message = error instanceof Error ? error.message : String(error);
          resolve({ alive: true, lastActivityAt: 0, hint: `probe-error: ${message}` });
        });
    });
  }
}
