import type {
  IntegrationRecord,
  TaskRecord,
  TrackedPrCheckRun,
  TrackedPrRecord,
  TrackedPrState,
} from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import type { PebbleJsonValue } from '@two-pebble/pebble';
import type { DaemonHeartbeatInput, DaemonHeartbeatReport } from '../../types';
import type { AgentRegistryService } from '../agent-registry/service';
import { DaemonService } from '../daemon-service';
import type { TaskBoardService } from '../task-board/service';
import { evaluatePullRequest, fetchPullRequest } from './gh-cli';
import type {
  BackoffEntry,
  GithubChecksResponse,
  GithubHeartbeatDetail,
  GithubPullResponse,
  PollOutcome,
} from './types';

/**
 * Daemon service that polls tracked GitHub pull requests on each heartbeat,
 * advances their stored state, and applies per-repo backoff when the GitHub
 * API errors or rate-limits.
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
        if (this.isBackedOff(row.repo, input.now)) {
          continue;
        }
        detail.polled += 1;
        const outcome = await this.pollOne(row, input.now);
        if (outcome.kind === 'not-modified') {
          continue;
        }
        if (outcome.kind === 'error') {
          detail.errors.push({ message: outcome.message, prId: outcome.prId, status: outcome.status });
          continue;
        }
        if (outcome.next === outcome.row.state && checksEqual(outcome.row.checks, outcome.checks)) {
          await this.daemon.datastore.trackedPrs.update({
            id: outcome.row.id,
            etag: outcome.etag,
            lastCheckedAt: input.now,
          });
          continue;
        }
        await this.applyTransition(outcome.row, outcome.next, outcome.checks, outcome.etag, input.now);
        detail.transitioned += 1;
        detail.prUpdates.push({
          checks: outcome.checks,
          from: outcome.row.state,
          prId: outcome.row.id,
          to: outcome.next,
        });
      }
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
    const integration = await this.matchIntegration(parsed.repo);
    const row = await this.daemon.datastore.trackedPrs.upsert({
      agentId: input.agentId,
      deliverableId: deliverable.id,
      integrationId: integration.id,
      number: parsed.number,
      repo: parsed.repo,
      state: 'mergeable',
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

  public async applyPrSignal(input: { agentId: string; prId: string; next: TrackedPrState }): Promise<void> {
    const row = await this.daemon.datastore.trackedPrs.read({ id: input.prId });
    if (row.agentId !== input.agentId) {
      throw new Error(`tracked PR "${row.id}" is owned by "${row.agentId}", not "${input.agentId}"`);
    }
    if (input.next === 'merged') {
      const submission = await this.daemon.datastore.taskBoards.deliverableSubmissions.upsert({
        deliverableId: row.deliverableId,
        payload: JSON.stringify({ type: 'pr_url', url: row.url }),
        taskId: row.taskId,
      });
      this.daemon.events.emit('taskDeliverableSubmissionRecorded', {
        ...submission,
        payload: { type: 'pr_url', url: row.url },
      });
      const openForTask = await this.daemon.datastore.trackedPrs.list({
        taskId: row.taskId,
        state: ['mergeable', 'unmergeable'],
      });
      if (openForTask.items.length === 0) {
        const task = await this.findTask(row.taskId);
        try {
          const outcome = await this.taskBoards.setTaskStatus(task.boardId, {
            id: row.taskId,
            reason: `auto: all tracked PRs merged`,
            status: 'success',
          });
          this.broadcastTaskOutcome(outcome);
        } catch (error) {
          // The task still has unsubmitted deliverables; leave it where it is
          // rather than crashing the signal handler. It will succeed once the
          // remaining deliverables are submitted.
          logger.warn('auto success blocked by outstanding deliverables', {
            error: error instanceof Error ? error.message : String(error),
            taskId: row.taskId,
          });
        }
      }
      return;
    }
    if (input.next === 'unmergeable' || input.next === 'closed') {
      const task = await this.findTask(row.taskId);
      const outcome = await this.taskBoards.setTaskStatus(task.boardId, {
        id: row.taskId,
        reason: `auto: PR ${row.repo}#${row.number} ${input.next}`,
        status: 'working',
      });
      this.broadcastTaskOutcome(outcome);
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
      const integration = await this.daemon.datastore.integrations.read({ id: row.integrationId });
      const apiKey = githubApiKey(integration);
      const pull = await this.fetchJson<GithubPullResponse>(
        `https://api.github.com/repos/${row.repo}/pulls/${row.number}`,
        apiKey,
        row.etag,
      );
      if (pull.status === 304) {
        return { kind: 'not-modified', prId: row.id };
      }
      if (pull.status === 403 || pull.status === 429 || pull.status >= 500) {
        this.applyBackoff(row.repo, now);
        return { kind: 'error', message: pull.message, prId: row.id, status: pull.status };
      }
      if (pull.body === undefined) {
        return { kind: 'error', message: pull.message, prId: row.id, status: pull.status };
      }
      this.backoff.delete(row.repo);
      const checks = await this.fetchChecks(row.repo, pull.body.head.sha, apiKey);
      return {
        checks,
        etag: pull.etag,
        kind: 'transition',
        next: stateFromPull(pull.body),
        row,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.applyBackoff(row.repo, now);
      return { kind: 'error', message, prId: row.id, status: 0 };
    }
  }

  private async fetchChecks(repo: string, sha: string, apiKey: string): Promise<TrackedPrCheckRun[]> {
    const result = await this.fetchJson<GithubChecksResponse>(
      `https://api.github.com/repos/${repo}/commits/${sha}/check-runs`,
      apiKey,
    );
    if (result.body === undefined || result.status < 200 || result.status >= 300) {
      return [];
    }
    return result.body.check_runs.map((run) => ({
      conclusion: checkConclusion(run.conclusion),
      name: run.name,
      status: checkStatus(run.status),
      url: run.html_url,
    }));
  }

  private async fetchJson<T>(
    url: string,
    apiKey: string,
    etag?: string | null,
  ): Promise<{ body?: T; etag: string | null; message: string; status: number }> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'two-pebble',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (etag !== undefined && etag !== null) {
      headers['If-None-Match'] = etag;
    }
    const response = await fetch(url, { headers });
    if (response.status === 304) {
      return { etag: response.headers.get('etag'), message: 'not modified', status: 304 };
    }
    const body = (await response.json().catch(() => undefined)) as T | { message?: string } | undefined;
    const message =
      body !== undefined &&
      body !== null &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : response.statusText;
    return {
      body: response.ok ? (body as T) : undefined,
      etag: response.headers.get('etag'),
      message,
      status: response.status,
    };
  }

  private async applyTransition(
    row: TrackedPrRecord,
    next: TrackedPrState,
    checks: TrackedPrCheckRun[],
    etag: string | null,
    now: number,
  ): Promise<void> {
    const updated = await this.daemon.datastore.trackedPrs.update({
      checks,
      etag,
      id: row.id,
      lastCheckedAt: now,
      lastEventAt: now,
      state: next,
    });
    this.daemon.events.emit('trackedPrRecorded', updated);
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

  private applyBackoff(repo: string, now: number): void {
    const previous = this.backoff.get(repo);
    const attempt = (previous?.attempt ?? 0) + 1;
    const delayMs = Math.min(2 ** (attempt - 1) * 60_000, 30 * 60_000);
    this.backoff.set(repo, { attempt, until: now + delayMs });
  }

  private isBackedOff(repo: string, now: number): boolean {
    const entry = this.backoff.get(repo);
    return entry !== undefined && entry.until > now;
  }

  private async matchIntegration(repo: string): Promise<IntegrationRecord> {
    const { items } = await this.daemon.datastore.integrations.list({ limit: 1000, offset: 0 });
    const github = items.filter((item) => item.provider === 'github');
    const matching = github.filter((item) => {
      const repositories = githubRepositories(item);
      return repositories.length === 0 || repositories.includes(repo);
    });
    if (matching.length === 1) {
      return matching[0];
    }
    if (matching.length === 0) {
      throw new Error(`No GitHub integration configured for ${repo}`);
    }
    throw new Error(`Multiple GitHub integrations match ${repo}; set repositories on the integration data.`);
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

function stateFromPull(pull: GithubPullResponse): TrackedPrState {
  if (pull.merged === true) {
    return 'merged';
  }
  if (pull.state === 'closed') {
    return 'closed';
  }
  return pull.mergeable === false ? 'unmergeable' : 'mergeable';
}

function checkStatus(value: string): TrackedPrCheckRun['status'] {
  if (value === 'queued' || value === 'in_progress' || value === 'completed') {
    return value;
  }
  return 'queued';
}

function checkConclusion(value: string | null): TrackedPrCheckRun['conclusion'] {
  if (value === 'success' || value === 'failure' || value === 'cancelled') {
    return value;
  }
  return null;
}

function checksEqual(a: TrackedPrCheckRun[], b: TrackedPrCheckRun[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function githubApiKey(integration: IntegrationRecord): string {
  const data = integration.data;
  if (data !== null && typeof data === 'object' && 'apiKey' in data && typeof data.apiKey === 'string') {
    return data.apiKey;
  }
  throw new Error(`GitHub integration "${integration.id}" is missing data.apiKey`);
}

function githubRepositories(integration: IntegrationRecord): string[] {
  const data = integration.data;
  if (data === null || typeof data !== 'object' || !('repositories' in data) || !Array.isArray(data.repositories)) {
    return [];
  }
  return data.repositories.filter((item): item is string => typeof item === 'string');
}
