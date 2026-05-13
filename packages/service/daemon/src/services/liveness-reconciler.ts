import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, ProbeResult } from '@two-pebble/pebble';
import type { AgentLivenessEvent } from '@two-pebble/protocol';
import type { AgentRegistryService } from './agent-registry-service';

type LivenessPayload = AgentLivenessEvent['payload'];
type Broadcaster = (payload: LivenessPayload) => void;

const TICK_MS = 2_000;
const PROBE_TIMEOUT_MS = 250;
const STALE_AFTER_MS = 60_000;
const REHYDRATE_BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];

interface LivenessReconcilerInput {
  agentRegistry: AgentRegistryService;
  broadcast: Broadcaster;
  daemonBootId: string;
  datastore: Datastore;
  logger: Logger;
  rehydrate?: (agentId: string) => Promise<Agent>;
}

interface RehydrationState {
  attempts: number;
  nextAttemptAt: number;
  lastError?: string;
  inflight: boolean;
}

interface ProbeableAgent {
  probe(): Promise<ProbeResult>;
}

/**
 * Continuously reconciles "intent" (durable agent.status) with "actuality"
 * (whether a live agent process is running, what its probe says). Ticks on
 * a fixed interval, broadcasts a liveness snapshot per non-terminal agent,
 * and (when enabled) rehydrates orphans with exponential backoff. Never
 * writes durable agent status itself; that stays in the agent's own code.
 */
export class LivenessReconciler {
  private readonly agentRegistry: AgentRegistryService;
  private readonly broadcast: Broadcaster;
  private readonly daemonBootId: string;
  private readonly datastore: Datastore;
  private readonly logger: Logger;
  private readonly rehydrateAgent?: (agentId: string) => Promise<Agent>;
  private readonly rehydrationState = new Map<string, RehydrationState>();
  private timer: ReturnType<typeof setInterval> | undefined;
  private tickInflight = false;

  public constructor(input: LivenessReconcilerInput) {
    this.agentRegistry = input.agentRegistry;
    this.broadcast = input.broadcast;
    this.daemonBootId = input.daemonBootId;
    this.datastore = input.datastore;
    this.logger = input.logger;
    this.rehydrateAgent = input.rehydrate;
  }

  /**
   * Starts the periodic reconcile loop. Idempotent — calling start twice
   * does not stack timers. Caller is responsible for matching with stop().
   */
  public start(): void {
    if (this.timer !== undefined) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
  }

  /**
   * Stops the reconcile loop. Pending probes already started this tick are
   * allowed to finish but no further ticks will be scheduled.
   */
  public stop(): void {
    if (this.timer === undefined) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  /**
   * Clears any cached rehydration backoff state for an agent so the next
   * tick attempts a fresh rehydration immediately rather than waiting for
   * the prior attempt's exponential delay.
   */
  public resetRehydration(agentId: string): void {
    this.rehydrationState.delete(agentId);
  }

  private async tick(): Promise<void> {
    if (this.tickInflight) return;
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
        record.status !== 'offline'
      ) {
        continue;
      }
      const active = this.agentRegistry.get(record.id);
      if (active !== undefined) {
        await this.broadcastActive(record.id, active, now);
        continue;
      }
      if (record.status === 'idle' || record.status === 'offline') continue;
      await this.maybeRehydrate(record.id, now);
    }
  }

  private async broadcastActive(agentId: string, agent: Agent, now: number): Promise<void> {
    const probe = await this.probeWithTimeout(agent);
    this.rehydrationState.delete(agentId);
    const state = deriveActiveState(probe, now);
    this.broadcast({
      agentId,
      daemonBootId: this.daemonBootId,
      state,
      lastActivityAt: probe.lastActivityAt,
      hint: probe.hint,
    });
  }

  private async maybeRehydrate(agentId: string, now: number): Promise<void> {
    const rehydrate = this.rehydrateAgent;
    let state = this.rehydrationState.get(agentId);
    if (state === undefined) {
      state = { attempts: 0, nextAttemptAt: now, inflight: false };
      this.rehydrationState.set(agentId, state);
    }
    this.broadcast({
      agentId,
      daemonBootId: this.daemonBootId,
      state: 'reconnecting',
      lastActivityAt: 0,
      rehydrationAttempts: state.attempts,
      lastError: state.lastError,
    });
    if (rehydrate === undefined) return;
    if (state.inflight) return;
    if (now < state.nextAttemptAt) return;
    state.inflight = true;
    try {
      await rehydrate(agentId);
      this.rehydrationState.delete(agentId);
    } catch (error) {
      state.attempts += 1;
      state.lastError = error instanceof Error ? error.message : String(error);
      const backoff = REHYDRATE_BACKOFF_MS[Math.min(state.attempts, REHYDRATE_BACKOFF_MS.length) - 1];
      state.nextAttemptAt = Date.now() + (backoff ?? REHYDRATE_BACKOFF_MS[REHYDRATE_BACKOFF_MS.length - 1]);
      this.logger.warn('agent rehydration attempt failed', {
        agentId,
        attempt: state.attempts,
        error: state.lastError,
      });
    } finally {
      state.inflight = false;
    }
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
        .catch((error: unknown) => {
          clearTimeout(timer);
          const message = error instanceof Error ? error.message : String(error);
          resolve({ alive: true, lastActivityAt: 0, hint: `probe-error: ${message}` });
        });
    });
  }
}

function deriveActiveState(probe: ProbeResult, now: number): LivenessPayload['state'] {
  if (probe.settled === 'idle') return 'idle';
  if (!probe.alive) return 'idle';
  if (probe.lastActivityAt > 0 && now - probe.lastActivityAt > STALE_AFTER_MS) return 'stalled';
  return 'running';
}
