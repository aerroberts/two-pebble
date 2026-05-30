import { describe, expect, test } from 'bun:test';
import type { TrackedPrCheckRun } from '@two-pebble/datastore';
import { evaluatePullRequest } from './service';
import type { GithubPullResponse } from './types';

function pull(overrides: Partial<GithubPullResponse> = {}): GithubPullResponse {
  return {
    head: { sha: 'abc' },
    mergeable: true,
    mergeable_state: 'clean',
    merged: false,
    state: 'open',
    ...overrides,
  };
}

function check(overrides: Partial<TrackedPrCheckRun> = {}): TrackedPrCheckRun {
  return { conclusion: 'success', name: 'ci', status: 'completed', url: 'https://example.com', ...overrides };
}

describe('feature: evaluatePullRequest', () => {
  test('good: open, mergeable, up to date, green CI returns no reasons', () => {
    expect(evaluatePullRequest(pull(), [check()])).toEqual([]);
  });

  test('good: no checks counts as green', () => {
    expect(evaluatePullRequest(pull(), [])).toEqual([]);
  });

  test('merged: a merged pull request is rejected', () => {
    expect(evaluatePullRequest(pull({ merged: true }), [])).toContain('the pull request is already merged');
  });

  test('closed: a closed pull request is rejected', () => {
    expect(evaluatePullRequest(pull({ state: 'closed' }), [])).toContain('the pull request is not open');
  });

  test('conflicts: mergeable false is rejected', () => {
    expect(evaluatePullRequest(pull({ mergeable: false }), [])).toContain('the pull request has merge conflicts');
  });

  test('conflicts: dirty mergeable_state is rejected', () => {
    expect(evaluatePullRequest(pull({ mergeable_state: 'dirty' }), [])).toContain(
      'the pull request has merge conflicts',
    );
  });

  test('pending: null mergeable asks the caller to retry', () => {
    const reasons = evaluatePullRequest(pull({ mergeable: null }), []);
    expect(reasons.some((reason) => reason.includes('has not finished computing mergeability'))).toBe(true);
  });

  test('behind: a branch behind its base is rejected', () => {
    expect(evaluatePullRequest(pull({ mergeable_state: 'behind' }), [])).toContain(
      'the branch is out of date with its base branch',
    );
  });

  test('ci: a failing check is rejected and named', () => {
    const reasons = evaluatePullRequest(pull(), [check({ conclusion: 'failure', name: 'unit' })]);
    expect(reasons.some((reason) => reason.includes('CI is not green') && reason.includes('unit'))).toBe(true);
  });

  test('ci: an in-progress check is not green', () => {
    const reasons = evaluatePullRequest(pull(), [check({ conclusion: null, status: 'in_progress', name: 'build' })]);
    expect(reasons.some((reason) => reason.includes('CI is not green') && reason.includes('build'))).toBe(true);
  });

  test('multiple: every failing condition is reported', () => {
    const reasons = evaluatePullRequest(pull({ state: 'closed', mergeable: false }), [
      check({ conclusion: 'failure', name: 'unit' }),
    ]);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
  });
});
