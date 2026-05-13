import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, ProbeResult } from '@two-pebble/pebble';
import type { AgentRegistryService } from './agent-registry-service';
import { PROBE_TIMEOUT_MS, TICK_MS } from './liveness-reconciler-constants';
import { deriveActiveState } from './liveness-reconciler-state';
import type {
  LivenessBroadcaster,
  LivenessReconcilerInput,
  LivenessTimer,
  ProbeableAgent,
} from './liveness-reconciler-types';

/**
 * Reconciles durable agent status with the hot runtime registry. Running
 * rows must have a live runtime object; otherwise they are interrupted.
 * Hot running agents get periodic liveness broadcasts for the UI.
 */
export class LivenessReconciler {
  private readonly agentRegistry: AgentRegistryService;
  private readonly broadcast: LivenessBroadcaster;
  private readonly daemonBootId: string;
  private readonly datastore: Datastore;
  private readonly logger: Logger;
  private timer: LivenessTimer | undefined;
  private tickInflight = false;

  public constructor(input: LivenessReconcilerInput) {
    this.agentRegistry = input.agentRegistry;
    this.broadcast = input.broadcast;
    this.daemonBootId = input.daemonBootId;
    this.datastore = input.datastore;
    this.logger = input.logger;
  }

  /**
   * Starts the periodic reconcile loop. Idempotent — calling start twice
   * does not stack timers. Caller is responsible for matching with stop().
   */
  public start(): void {
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
  public stop(): void {
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
      this.logger.warn('liveness reconciler tick failed', { error: message });
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
    this.broadcast({
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
