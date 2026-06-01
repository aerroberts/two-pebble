import { spawn } from 'node:child_process';
import type { TrackedPrCheckRun, TrackedPrState } from '@two-pebble/datastore';

/**
 * A single entry from a pull request's `statusCheckRollup`.
 * `gh` returns either CheckRun rows (status/conclusion) or StatusContext rows
 * (state); both shapes are captured here so the evaluator can read whichever
 * fields a given provider populated.
 */
export interface GhCheck {
  __typename?: string;
  name?: string;
  status?: string;
  conclusion?: string;
  context?: string;
  state?: string;
  detailsUrl?: string;
  targetUrl?: string;
}

/**
 * The subset of `gh pr view --json` fields needed to judge a pull request.
 * Mirrors GitHub's GraphQL enums verbatim so no remapping is required.
 */
export interface GhPullRequest {
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  mergeable: 'MERGEABLE' | 'CONFLICTING' | 'UNKNOWN';
  mergeStateStatus: string;
  statusCheckRollup: GhCheck[];
}

/**
 * Reads a pull request through the locally authenticated `gh` CLI.
 * Uses the machine's existing GitHub auth, so no token or integration needs to
 * be configured. Rejects with the CLI's stderr when `gh` is missing, not
 * authenticated, or the PR cannot be read.
 */
export async function fetchPullRequest(url: string): Promise<GhPullRequest> {
  const stdout = await runGh(['pr', 'view', url, '--json', 'state,mergeable,mergeStateStatus,statusCheckRollup']);
  return JSON.parse(stdout) as GhPullRequest;
}

/**
 * True when a `gh` failure means the pull request no longer exists or is no
 * longer reachable (deleted PR, deleted/renamed repo, lost access) — as opposed
 * to a transient failure (network, rate limit, auth hiccup). Callers terminalize
 * a gone PR instead of backing off on it forever, so an agent does not wait on a
 * PR that can never resolve. Matches against the CLI's stderr, which `runGh`
 * folds into the rejection message.
 */
export function isPullRequestGoneError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes('could not resolve to a pullrequest') ||
    message.includes('no pull requests found') ||
    message.includes('could not resolve to a repository') ||
    /\bnot found\b/.test(message)
  );
}

/**
 * Returns the reasons a pull request is not ready to merge.
 * An empty array means the PR is good: open, conflict-free, up to date with its
 * base branch, and passing every CI check. Draft PRs are accepted — GitHub
 * still reports them as `OPEN` — as long as their CI is green. Pure helper so
 * it can be unit tested without invoking `gh`.
 */
export function evaluatePullRequest(pull: GhPullRequest): string[] {
  const reasons: string[] = [];
  if (pull.state === 'MERGED') {
    reasons.push('the pull request is already merged');
  } else if (pull.state !== 'OPEN') {
    reasons.push('the pull request is not open');
  }
  if (pull.mergeable === 'CONFLICTING' || pull.mergeStateStatus === 'DIRTY') {
    reasons.push('the pull request has merge conflicts');
  } else if (pull.mergeable === 'UNKNOWN') {
    reasons.push('GitHub has not finished computing mergeability yet; try again shortly');
  }
  if (pull.mergeStateStatus === 'BEHIND') {
    reasons.push('the branch is out of date with its base branch');
  }
  const failing = (pull.statusCheckRollup ?? []).filter((check) => !isCheckGreen(check));
  if (failing.length > 0) {
    reasons.push(`CI is not green (${failing.map(checkName).join(', ')})`);
  }
  return reasons;
}

/**
 * Maps a `gh`-reported pull request to the daemon's tracked PR state.
 * Mirrors the previous REST mapping: merged/closed win, an unmergeable PR
 * (conflicts) becomes `unmergeable`, everything else is `mergeable`.
 */
export function trackedStateFromGh(pull: GhPullRequest): TrackedPrState {
  if (pull.state === 'MERGED') {
    return 'merged';
  }
  if (pull.state === 'CLOSED') {
    return 'closed';
  }
  if (pull.mergeable === 'CONFLICTING' || pull.mergeStateStatus === 'DIRTY') {
    return 'unmergeable';
  }
  return 'mergeable';
}

/**
 * Converts a `gh` status check rollup into the daemon's stored check shape.
 * StatusContext rows (legacy commit statuses) carry their result in `state`;
 * CheckRun rows carry `status`/`conclusion`.
 */
export function checksFromGh(pull: GhPullRequest): TrackedPrCheckRun[] {
  return (pull.statusCheckRollup ?? []).map((check) => ({
    conclusion: ghCheckConclusion(check),
    name: checkName(check),
    status: ghCheckStatus(check),
    url: check.detailsUrl ?? check.targetUrl ?? '',
  }));
}

function ghCheckStatus(check: GhCheck): TrackedPrCheckRun['status'] {
  const status = (check.status ?? '').toLowerCase();
  if (status === 'queued' || status === 'in_progress' || status === 'completed') {
    return status;
  }
  // StatusContext rows have no `status`; treat them as completed commit statuses.
  return 'completed';
}

function ghCheckConclusion(check: GhCheck): TrackedPrCheckRun['conclusion'] {
  const raw = (check.conclusion ?? check.state ?? '').toUpperCase();
  if (raw === 'SUCCESS') {
    return 'success';
  }
  if (raw === 'FAILURE' || raw === 'ERROR') {
    return 'failure';
  }
  if (raw === 'CANCELLED') {
    return 'cancelled';
  }
  return null;
}

function isCheckGreen(check: GhCheck): boolean {
  // StatusContext rows (legacy commit statuses) report a single `state`.
  if (check.state !== undefined) {
    return check.state === 'SUCCESS';
  }
  // CheckRun rows must be completed; neutral/skipped runs do not block a merge.
  if (check.status !== undefined && check.status !== 'COMPLETED') {
    return false;
  }
  return check.conclusion === 'SUCCESS' || check.conclusion === 'NEUTRAL' || check.conclusion === 'SKIPPED';
}

function checkName(check: GhCheck): string {
  return check.name ?? check.context ?? 'check';
}

function runGh(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('gh', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(`gh ${args.join(' ')} failed: ${stderr.trim() || `exit code ${code}`}`));
    });
  });
}
