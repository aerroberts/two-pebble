import { spawn } from 'node:child_process';

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
 * Returns the reasons a pull request is not ready to merge.
 * An empty array means the PR is good: open, conflict-free, up to date with its
 * base branch, and passing every CI check. Pure helper so it can be unit tested
 * without invoking `gh`.
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
