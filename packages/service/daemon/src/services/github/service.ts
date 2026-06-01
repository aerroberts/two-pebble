import type { TaskRecord, TrackedPrCheckRun, TrackedPrRecord, TrackedPrState } from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import type { PebbleJsonValue } from '@two-pebble/pebble';
import type { DaemonHeartbeatInput, DaemonHeartbeatReport } from '../../types';
import type { AgentRegistryService } from '../agent-registry/service';
import { DaemonService } from '../daemon-service';
import type { TaskBoardService } from '../task-board/service';
import {
  checksFromGh,
  evaluatePullRequest,
  fetchPullRequest,
  isPullRequestGoneError,
  trackedStateFromGh,
} from './gh-cli';
import type { BackoffEntry, GithubHeartbeatDetail, PollOutcome } from './types';

/**
 * Daemon service that polls tracked GitHub pull requests on each heartbeat,
 * advances their stored state, and applies per-PR backoff when the GitHub
 * API errors or rate-limits, so one failing PR cannot throttle the rest.
 */
export class GithubService extends DaemonService {
  public readonly id = 'github';
  private readonly backoff = new Map<string, BackoffEntry>();

  private get agentRegistry(): AgentRegistryService {
    return this.daemon.requireService<AgentRegistryService>('agent-registry');
  }

  private get taskBoards(): TaskBoardService {
    return this.daemon.requireService<TaskBoardService>('task-board');
  }

  public override async onHeartbeat(input: DaemonHeartbeatInput): Promise<DaemonHeartbeatReport> {
    const detail: GithubHeartbeatDetail = { polled: 0, transitioned: 0, prUpdates: [], errors: [] };
    try {
      const threshold = input.now - 20_000;
      const { items } = await this.daemon.datastore.trackedPrs.listOpen({ limit: 50, pollableBefore: threshold });
      for (const row of items) {
        if (this.isBackedOff(row.id, input.now)) {
          continue;
        }
        detail.polled += 1;
        const outcome = await this.pollOne(row, input.now);
        if (outcome.kind === 'error') {
          detail.errors.push({ message: outcome.message, prId: outcome.prId, status: outcome.status });
          // Advance the poll cursor even on a transient failure so this row does
          // not dominate every subsequent heartbeat ahead of healthy PRs.
          await this.daemon.datastore.trackedPrs.update({ id: outcome.prId, lastCheckedAt: input.now });
          continue;
        }
        if (outcome.next === outcome.row.state && checksEqual(outcome.row.checks, outcome.checks)) {
          await this.daemon.datastore.trackedPrs.update({
            id: outcome.row.id,
            lastCheckedAt: input.now,
          });
          continue;
        }
        await this.applyTransition(outcome.row, outcome.next, outcome.checks, input.now);
        detail.transitioned += 1;
        detail.prUpdates.push({
          checks: outcome.checks,
          from: outcome.row.state,
          prId: outcome.row.id,
          to: outcome.next,
        });
      }
      await this.reconcileMergedWaitingTasks();
      return { outcome: detail.polled === 0 ? 'skipped' : 'fired', detail };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      detail.errors.push({ message, prId: '', status: 0 });
      logger.warn('github heartbeat failed', { error: message });
      return { outcome: 'error', detail };
    }
  }

  public async submitPr(input: { agentId: string; deliverableId: string; url: string }): Promise<TrackedPrRecord> {
    const parsed = parseGithubPullRequestUrl(input.url);
    const { task, deliverable } = await this.findOwnedPrDeliverable(input.agentId, input.deliverableId);
    // Verify the PR actually exists and capture its real state rather than
    // blindly trusting the agent's URL and recording it as `mergeable`. A
    // non-existent or already-closed PR can never merge, so reject it instead
    // of parking the task in `waiting` on a dead reference forever. (An already
    // `merged` PR is tracked normally; the reconciliation sweep then drives the
    // task to success on the next heartbeat.)
    let initialState: TrackedPrState;
    try {
      const pull = await fetchPullRequest(parsed.url);
      if (pull.state === 'CLOSED') {
        throw new Error(`PR ${parsed.repo}#${parsed.number} is closed and cannot be tracked.`);
      }
      initialState = trackedStateFromGh(pull);
    } catch (error) {
      if (isPullRequestGoneError(error)) {
        throw new Error(`PR ${parsed.repo}#${parsed.number} does not exist or is not accessible.`);
      }
      throw error;
    }
    const row = await this.daemon.datastore.trackedPrs.upsert({
      agentId: input.agentId,
      deliverableId: deliverable.id,
      number: parsed.number,
      repo: parsed.repo,
      state: initialState,
      taskId: task.id,
      url: parsed.url,
    });
    await this.daemon.datastore.agent.signals.register({
      agentId: input.agentId,
      capabilityId: 'github',
      description: `Wait for GitHub PR ${row.repo}#${row.number} to merge or need attention.`,
      name: 'pr-changed',
      signalId: signalIdForPr(row.id),
    });
    this.daemon.events.emit('trackedPrRecorded', row);
    const outcome = await this.taskBoards.setTaskStatusAsAgent({
      agentId: input.agentId,
      reason: `auto: waiting for PR ${row.repo}#${row.number}`,
      status: 'waiting',
      taskId: task.id,
    });
    this.broadcastTaskOutcome(outcome);
    return row;
  }

  /**
   * Asserts that a pull request URL is in a mergeable, passing state.
   * A PR is acceptable as a deliverable only when it is open, has no merge
   * conflicts, its branch is up to date with the base, and every CI check has
   * completed successfully. Reads the PR through the locally authenticated `gh`
   * CLI so no integration or token needs to be configured. Throws an Error
   * describing every failing condition so callers can reject the submission
   * with an actionable message.
   */
  public async validatePullRequest(url: string): Promise<void> {
    const parsed = parseGithubPullRequestUrl(url);
    const pull = await fetchPullRequest(parsed.url);
    const reasons = evaluatePullRequest(pull);
    if (reasons.length > 0) {
      throw new Error(`PR ${parsed.repo}#${parsed.number} is not ready to merge: ${reasons.join('; ')}`);
    }
  }

  public async hasOpenPrs(agentId: string): Promise<boolean> {
    const { items } = await this.daemon.datastore.trackedPrs.list({
      agentId,
      limit: 1,
      state: ['mergeable', 'unmergeable'],
    });
    return items.length > 0;
  }

  /**
   * Applies a tracked PR signal forwarded by the agent runtime. The task
   * effects are identical to (and idempotent with) the daemon poller's, so the
   * agent path stays consistent whether or not the poller already reconciled.
   */
  public async applyPrSignal(input: { agentId: string; prId: string; next: TrackedPrState }): Promise<void> {
    const row = await this.daemon.datastore.trackedPrs.read({ id: input.prId });
    if (row.agentId !== input.agentId) {
      throw new Error(`tracked PR "${row.id}" is owned by "${row.agentId}", not "${input.agentId}"`);
    }
    await this.applyTerminalPrEffects(row, input.next);
  }

  /**
   * Drives the task-level consequences of a terminal PR state. This is the
   * single, daemon-authoritative place the effects live so they fire from the
   * poller regardless of whether the owning agent is alive to consume the
   * signal — previously a merged PR with a failed/offline agent left its task
   * stuck forever. Idempotent: safe to run from both the poller and the agent
   * signal path, and a no-op once the task has settled.
   */
  private async applyTerminalPrEffects(row: TrackedPrRecord, next: TrackedPrState): Promise<void> {
    if (next === 'merged') {
      await this.recordPrSubmission(row);
      const openForTask = await this.daemon.datastore.trackedPrs.list({
        taskId: row.taskId,
        state: ['mergeable', 'unmergeable'],
      });
      if (openForTask.items.length > 0) {
        return;
      }
      const task = await this.findTask(row.taskId);
      if (isTerminalTaskStatus(task.status)) {
        return;
      }
      try {
        const outcome = await this.taskBoards.setTaskStatus(task.boardId, {
          id: row.taskId,
          reason: `auto: all tracked PRs merged`,
          status: 'success',
        });
        this.broadcastTaskOutcome(outcome);
      } catch (error) {
        // The task still has unsubmitted deliverables; leave it where it is
        // rather than crashing. It succeeds once the rest are submitted, or on
        // a later reconciliation pass.
        logger.warn('auto success blocked by outstanding deliverables', {
          error: error instanceof Error ? error.message : String(error),
          taskId: row.taskId,
        });
      }
      return;
    }
    if (next === 'unmergeable' || next === 'closed') {
      const task = await this.findTask(row.taskId);
      // Never try to leave a terminal task (the engine rejects it and the old
      // code crashed the signal handler), and skip the redundant no-op when the
      // task is already back in `working`.
      if (isTerminalTaskStatus(task.status) || task.status === 'working') {
        return;
      }
      try {
        const outcome = await this.taskBoards.setTaskStatus(task.boardId, {
          id: row.taskId,
          reason: `auto: PR ${row.repo}#${row.number} ${next}`,
          status: 'working',
        });
        this.broadcastTaskOutcome(outcome);
      } catch (error) {
        logger.warn('auto reopen on PR change failed', {
          error: error instanceof Error ? error.message : String(error),
          taskId: row.taskId,
        });
      }
    }
  }

  private async recordPrSubmission(row: TrackedPrRecord): Promise<void> {
    const submission = await this.daemon.datastore.taskBoards.deliverableSubmissions.upsert({
      deliverableId: row.deliverableId,
      payload: JSON.stringify({ type: 'pr_url', url: row.url }),
      taskId: row.taskId,
    });
    this.daemon.events.emit('taskDeliverableSubmissionRecorded', {
      ...submission,
      payload: { type: 'pr_url', url: row.url },
    });
  }

  /**
   * Belt-and-suspenders pass over tasks parked in `waiting`: if every tracked
   * PR for the task has merged (none still open) it drives the task to success.
   * Covers transitions whose task effect was missed — for example because the
   * daemon restarted between the merge poll and the status write, or an earlier
   * attempt failed transiently. Bounded to `waiting` tasks so it stays a no-op
   * in steady state.
   */
  private async reconcileMergedWaitingTasks(): Promise<void> {
    const { items: boards } = await this.daemon.datastore.taskBoards.list({});
    for (const board of boards) {
      const { items: tasks } = await this.daemon.datastore.taskBoards.tasks.list({ boardId: board.id });
      for (const task of tasks) {
        if (task.status !== 'waiting') {
          continue;
        }
        const open = await this.daemon.datastore.trackedPrs.list({
          taskId: task.id,
          state: ['mergeable', 'unmergeable'],
        });
        if (open.items.length > 0) {
          continue;
        }
        const merged = await this.daemon.datastore.trackedPrs.list({ taskId: task.id, state: ['merged'] });
        if (merged.items.length === 0) {
          continue;
        }
        for (const row of merged.items) {
          await this.recordPrSubmission(row);
        }
        try {
          const outcome = await this.taskBoards.setTaskStatus(board.id, {
            id: task.id,
            reason: 'auto: reconciled merged PRs',
            status: 'success',
          });
          this.broadcastTaskOutcome(outcome);
        } catch (error) {
          logger.warn('reconcile to success blocked by outstanding deliverables', {
            error: error instanceof Error ? error.message : String(error),
            taskId: task.id,
          });
        }
      }
    }
  }

  public async repairSignalsForAgent(agentId: string): Promise<void> {
    const { items } = await this.daemon.datastore.trackedPrs.list({
      agentId,
      state: ['mergeable', 'unmergeable'],
    });
    for (const row of items) {
      await this.daemon.datastore.agent.signals.register({
        agentId,
        capabilityId: 'github',
        description: `Wait for GitHub PR ${row.repo}#${row.number} to merge or need attention.`,
        name: 'pr-changed',
        signalId: signalIdForPr(row.id),
      });
    }
  }

  private async pollOne(row: TrackedPrRecord, now: number): Promise<PollOutcome> {
    try {
      const pull = await fetchPullRequest(row.url);
      this.backoff.delete(row.id);
      return {
        checks: checksFromGh(pull),
        kind: 'transition',
        next: trackedStateFromGh(pull),
        row,
      };
    } catch (error) {
      if (isPullRequestGoneError(error)) {
        // The PR (or its repo) no longer exists. Terminalize it as closed so the
        // task stops waiting on a PR that can never resolve, rather than backing
        // off on it indefinitely.
        this.backoff.delete(row.id);
        return { checks: row.checks, kind: 'transition', next: 'closed', row };
      }
      const message = error instanceof Error ? error.message : String(error);
      // Transient failure: back off this specific PR, not the whole repo, so one
      // bad PR cannot throttle every other tracked PR sharing its repo.
      this.applyBackoff(row.id, now);
      return { kind: 'error', message, prId: row.id, status: 0 };
    }
  }

  private async applyTransition(
    row: TrackedPrRecord,
    next: TrackedPrState,
    checks: TrackedPrCheckRun[],
    now: number,
  ): Promise<void> {
    const updated = await this.daemon.datastore.trackedPrs.update({
      checks,
      id: row.id,
      lastCheckedAt: now,
      lastEventAt: now,
      state: next,
    });
    this.daemon.events.emit('trackedPrRecorded', updated);
    // Drive the task effects from the poller, not just the agent signal path,
    // so a terminal PR reconciles the task even when the owning agent is dead.
    if (next === 'merged' || next === 'unmergeable' || next === 'closed') {
      await this.applyTerminalPrEffects(updated, next);
    }
    const data: PebbleJsonValue = {
      checks: checks.map((check) => ({
        conclusion: check.conclusion,
        name: check.name,
        status: check.status,
        url: check.url,
      })),
      next,
      prev: row.state,
      prId: row.id,
      type: 'pr-changed',
    };
    try {
      await this.daemon.datastore.agent.signals.resolve({
        agentId: row.agentId,
        capabilityId: 'github',
        data,
        signalId: signalIdForPr(row.id),
      });
    } catch {
      await this.daemon.datastore.agent.signals.sendPush({
        agentId: row.agentId,
        capabilityId: 'github',
        data,
        description: `GitHub PR ${row.repo}#${row.number} changed to ${next}.`,
        name: 'pr-changed',
        signalId: crypto.randomUUID(),
      });
    }
    await this.agentRegistry.wakeIfSignalsReady(row.agentId);
  }

  private applyBackoff(key: string, now: number): void {
    const previous = this.backoff.get(key);
    const attempt = (previous?.attempt ?? 0) + 1;
    const delayMs = Math.min(2 ** (attempt - 1) * 60_000, 30 * 60_000);
    this.backoff.set(key, { attempt, until: now + delayMs });
  }

  private isBackedOff(key: string, now: number): boolean {
    const entry = this.backoff.get(key);
    return entry !== undefined && entry.until > now;
  }

  private async findOwnedPrDeliverable(agentId: string, deliverableId: string) {
    const { items: boards } = await this.daemon.datastore.taskBoards.list({});
    for (const board of boards) {
      const { items: tasks } = await this.daemon.datastore.taskBoards.tasks.list({ boardId: board.id });
      for (const task of tasks) {
        if (task.ownerId !== agentId) {
          continue;
        }
        const { items: deliverables } = await this.daemon.datastore.taskBoards.deliverables.list({ taskId: task.id });
        const deliverable = deliverables.find((item) => item.id === deliverableId);
        if (deliverable !== undefined) {
          if (deliverable.type !== 'pr_url') {
            throw new Error(`deliverable "${deliverableId}" expects "${deliverable.type}", not "pr_url"`);
          }
          return { deliverable, task };
        }
      }
    }
    throw new Error(`owned PR deliverable "${deliverableId}" not found for agent "${agentId}"`);
  }

  private async findTask(taskId: string): Promise<TaskRecord> {
    const { items: boards } = await this.daemon.datastore.taskBoards.list({});
    for (const board of boards) {
      const { items } = await this.daemon.datastore.taskBoards.tasks.list({ boardId: board.id });
      const task = items.find((item) => item.id === taskId);
      if (task !== undefined) {
        return task;
      }
    }
    throw new Error(`task "${taskId}" not found`);
  }

  private broadcastTaskOutcome(outcome: { result: unknown; events: Array<{ taskId: string }> }): void {
    for (const event of outcome.events) {
      this.daemon.events.emit('taskEventRecorded', event as never);
    }
    this.daemon.events.emit('taskUpdated', outcome.result as never);
  }
}

export function parseGithubPullRequestUrl(value: string): { repo: string; number: number; url: string } {
  const url = new URL(value);
  if (url.hostname !== 'github.com') {
    throw new Error('Only github.com pull request URLs are supported');
  }
  const [owner, name, kind, number] = url.pathname.split('/').filter(Boolean);
  if (owner === undefined || name === undefined || kind !== 'pull' || number === undefined) {
    throw new Error('GitHub pull request URL must look like https://github.com/owner/repo/pull/123');
  }
  const parsedNumber = Number(number);
  if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
    throw new Error(`Invalid GitHub pull request number: ${number}`);
  }
  return {
    number: parsedNumber,
    repo: `${owner}/${name}`,
    url: `https://github.com/${owner}/${name}/pull/${parsedNumber}`,
  };
}

function signalIdForPr(id: string): string {
  return `pr:${id}`;
}

function isTerminalTaskStatus(status: string): boolean {
  return status === 'success' || status === 'failure' || status === 'canceled';
}

function checksEqual(a: TrackedPrCheckRun[], b: TrackedPrCheckRun[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
