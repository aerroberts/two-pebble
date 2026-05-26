import type { IntegrationRecord, TrackedPrRecord } from '@two-pebble/datastore';
import { logger } from '@two-pebble/logger';
import type { PebbleJsonValue } from '@two-pebble/pebble';
import { toProtocolTrackedPr } from '../../handlers/tracked-prs.list.handler';
import type { AgentRegistryService } from '../agent-registry/service';
import { DaemonService } from '../daemon-service';
import type { GithubHeartbeatDetail, TrackedPrCheckRun, TrackedPrState } from './types';

interface GithubBackoff {
  failures: number;
  until: number;
}

interface PollResult {
  state: TrackedPrState;
  checks: TrackedPrCheckRun[];
  etag: string | null;
  notModified?: boolean;
}

export class GithubService extends DaemonService {
  public readonly id = 'github';
  private readonly backoff = new Map<string, GithubBackoff>();

  private get agentRegistry(): AgentRegistryService {
    return this.daemon.requireService<AgentRegistryService>('agent-registry');
  }

  public override async onHeartbeat({ now }: { now: number }) {
    const open = await this.daemon.datastore.trackedPrs.listOpen();
    const integrations = await this.daemon.datastore.integrations.list({ limit: 500, offset: 0 });
    const detail: GithubHeartbeatDetail = { polled: 0, transitioned: 0, prUpdates: [], errors: [] };
    for (const pr of open.items) {
      if ((this.backoff.get(pr.repo)?.until ?? 0) > now) {
        continue;
      }
      const integration = integrations.items.find((entry) => entry.id === pr.integrationId);
      if (integration === undefined) {
        detail.errors.push({ prId: pr.id, status: 404, message: 'GitHub integration not found.' });
        continue;
      }
      detail.polled += 1;
      try {
        const result = await this.pollPr(pr, integration);
        if (result.notModified) {
          continue;
        }
        const previous = pr.state;
        const updated = await this.daemon.datastore.trackedPrs.update({
          id: pr.id,
          state: result.state,
          checks: JSON.stringify(result.checks),
          lastCheckedAt: now,
          lastEventAt: result.state === previous ? pr.lastEventAt : now,
          etag: result.etag,
        });
        this.daemon.events.emit('trackedPrRecorded', toProtocolTrackedPr(updated));
        if (result.state !== previous) {
          detail.transitioned += 1;
          detail.prUpdates.push({ prId: pr.id, from: previous, to: result.state, checks: result.checks });
          await this.applyTransition(pr, updated, result.checks);
        }
        this.backoff.delete(pr.repo);
      } catch (error) {
        const status = error instanceof GithubHttpError ? error.status : 0;
        const message = error instanceof Error ? error.message : String(error);
        detail.errors.push({ prId: pr.id, status, message });
        if (status === 403 || status === 429 || status >= 500) {
          this.recordBackoff(pr.repo, now);
        }
      }
    }
    const outcome = detail.polled > 0 ? 'fired' : 'skipped';
    return { outcome, detail: detail as unknown as Record<string, unknown> } as const;
  }

  private async pollPr(pr: TrackedPrRecord, integration: IntegrationRecord): Promise<PollResult> {
    const token = githubToken(integration);
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'two-pebble',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (pr.etag !== null) {
      headers['If-None-Match'] = pr.etag;
    }
    const pull = await githubJson(`https://api.github.com/repos/${pr.repo}/pulls/${pr.number}`, headers);
    if (pull.notModified) {
      return { state: pr.state, checks: parseChecks(pr.checks), etag: pr.etag, notModified: true };
    }
    const sha = stringField(pull.data, 'head', 'sha');
    const checks = sha === undefined ? [] : await this.fetchChecks(pr.repo, sha, headers);
    return {
      state: prState(pull.data, checks),
      checks,
      etag: pull.etag,
    };
  }

  private async fetchChecks(repo: string, sha: string, headers: Record<string, string>): Promise<TrackedPrCheckRun[]> {
    const response = await githubJson(`https://api.github.com/repos/${repo}/commits/${sha}/check-runs`, headers);
    if (response.notModified) {
      return [];
    }
    const runs = Array.isArray(response.data.check_runs) ? response.data.check_runs : [];
    return runs.map((run: Record<string, unknown>) => ({
      name: stringValue(run.name) ?? 'check',
      status: checkStatus(run.status),
      conclusion: checkConclusion(run.conclusion),
      url: stringValue(run.html_url) ?? stringValue(run.details_url) ?? '',
    }));
  }

  private async applyTransition(pr: TrackedPrRecord, updated: TrackedPrRecord, checks: TrackedPrCheckRun[]) {
    await this.daemon.datastore.agent.signals.resolve({
      agentId: pr.agentId,
      capabilityId: 'github',
      signalId: `pr:${pr.id}`,
      data: {
        checks,
        next: updated.state,
        prev: pr.state,
        prId: pr.id,
        type: 'pr-changed',
        url: pr.url,
      } as unknown as PebbleJsonValue,
    });
    await this.agentRegistry.wakeIfSignalsReady(pr.agentId);
  }

  private recordBackoff(repo: string, now: number): void {
    const current = this.backoff.get(repo)?.failures ?? 0;
    const failures = current + 1;
    const delay = Math.min(2 ** failures * 60_000, 30 * 60_000);
    this.backoff.set(repo, { failures, until: now + delay });
  }
}

class GithubHttpError extends Error {
  public constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function githubJson(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers });
  if (response.status === 304) {
    return { data: {}, etag: headers['If-None-Match'] ?? null, notModified: true };
  }
  if (!response.ok) {
    throw new GithubHttpError(response.status, `GitHub request failed: ${response.status}`);
  }
  return {
    data: (await response.json()) as Record<string, unknown>,
    etag: response.headers.get('etag'),
    notModified: false,
  };
}

function githubToken(integration: IntegrationRecord): string {
  if (integration.provider !== 'github' || typeof integration.data !== 'object' || integration.data === null) {
    throw new Error('Integration is not a GitHub integration.');
  }
  const token = (integration.data as { token?: unknown }).token;
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('GitHub integration is missing a token.');
  }
  return token;
}

function prState(data: Record<string, unknown>, checks: TrackedPrCheckRun[]): TrackedPrState {
  if (data.merged === true) {
    return 'merged';
  }
  if (data.state === 'closed') {
    return 'closed';
  }
  const hasFailingCheck = checks.some((check) => check.status === 'completed' && check.conclusion !== 'success');
  if (
    data.mergeable === false ||
    data.mergeable_state === 'dirty' ||
    data.mergeable_state === 'blocked' ||
    hasFailingCheck
  ) {
    return 'unmergeable';
  }
  return 'mergeable';
}

function parseChecks(serialized: string): TrackedPrCheckRun[] {
  try {
    const parsed = JSON.parse(serialized) as TrackedPrCheckRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.warn('tracked PR checks parse failed', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

function stringField(data: Record<string, unknown>, key: string, nested: string): string | undefined {
  const value = data[key];
  if (value === null || typeof value !== 'object') {
    return undefined;
  }
  return stringValue((value as Record<string, unknown>)[nested]);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function checkStatus(value: unknown): TrackedPrCheckRun['status'] {
  return value === 'queued' || value === 'in_progress' || value === 'completed' ? value : 'completed';
}

function checkConclusion(value: unknown): TrackedPrCheckRun['conclusion'] {
  if (value === 'success' || value === 'failure' || value === 'cancelled') {
    return value;
  }
  return null;
}
