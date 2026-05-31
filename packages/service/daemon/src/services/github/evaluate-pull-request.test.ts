import { describe, expect, test } from 'bun:test';
import { evaluatePullRequest, type GhCheck, type GhPullRequest } from './gh-cli';

function pull(overrides: Partial<GhPullRequest> = {}): GhPullRequest {
  return {
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    statusCheckRollup: [],
    ...overrides,
  };
}

function checkRun(overrides: Partial<GhCheck> = {}): GhCheck {
  return { __typename: 'CheckRun', name: 'ci', status: 'COMPLETED', conclusion: 'SUCCESS', ...overrides };
}

describe('feature: evaluatePullRequest', () => {
  test('good: open, mergeable, up to date, green CI returns no reasons', () => {
    expect(evaluatePullRequest(pull({ statusCheckRollup: [checkRun()] }))).toEqual([]);
  });

  test('good: no checks counts as green', () => {
    expect(evaluatePullRequest(pull())).toEqual([]);
  });

  test('good: neutral and skipped runs do not block', () => {
    const checks = [checkRun({ conclusion: 'NEUTRAL' }), checkRun({ conclusion: 'SKIPPED' })];
    expect(evaluatePullRequest(pull({ statusCheckRollup: checks }))).toEqual([]);
  });

  test('good: a draft PR with green CI is accepted', () => {
    const draft = pull({ state: 'OPEN', mergeStateStatus: 'DRAFT', statusCheckRollup: [checkRun()] });
    expect(evaluatePullRequest(draft)).toEqual([]);
  });

  test('draft: a draft with failing CI is still rejected for CI', () => {
    const draft = pull({
      state: 'OPEN',
      mergeStateStatus: 'DRAFT',
      statusCheckRollup: [checkRun({ conclusion: 'FAILURE', name: 'unit' })],
    });
    const reasons = evaluatePullRequest(draft);
    expect(reasons.some((reason) => reason.includes('CI is not green'))).toBe(true);
  });

  test('merged: a merged pull request is rejected', () => {
    expect(evaluatePullRequest(pull({ state: 'MERGED' }))).toContain('the pull request is already merged');
  });

  test('closed: a closed pull request is rejected', () => {
    expect(evaluatePullRequest(pull({ state: 'CLOSED' }))).toContain('the pull request is not open');
  });

  test('conflicts: CONFLICTING mergeable is rejected', () => {
    expect(evaluatePullRequest(pull({ mergeable: 'CONFLICTING' }))).toContain('the pull request has merge conflicts');
  });

  test('conflicts: DIRTY merge state is rejected', () => {
    expect(evaluatePullRequest(pull({ mergeStateStatus: 'DIRTY' }))).toContain('the pull request has merge conflicts');
  });

  test('pending: UNKNOWN mergeability asks the caller to retry', () => {
    const reasons = evaluatePullRequest(pull({ mergeable: 'UNKNOWN' }));
    expect(reasons.some((reason) => reason.includes('has not finished computing mergeability'))).toBe(true);
  });

  test('behind: a branch behind its base is rejected', () => {
    expect(evaluatePullRequest(pull({ mergeStateStatus: 'BEHIND' }))).toContain(
      'the branch is out of date with its base branch',
    );
  });

  test('ci: a failing check run is rejected and named', () => {
    const reasons = evaluatePullRequest(
      pull({ statusCheckRollup: [checkRun({ conclusion: 'FAILURE', name: 'unit' })] }),
    );
    expect(reasons.some((reason) => reason.includes('CI is not green') && reason.includes('unit'))).toBe(true);
  });

  test('ci: an in-progress check is not green', () => {
    const check = checkRun({ status: 'IN_PROGRESS', conclusion: undefined, name: 'build' });
    const reasons = evaluatePullRequest(pull({ statusCheckRollup: [check] }));
    expect(reasons.some((reason) => reason.includes('CI is not green') && reason.includes('build'))).toBe(true);
  });

  test('ci: a failing legacy status context is rejected', () => {
    const status: GhCheck = { __typename: 'StatusContext', context: 'legacy', state: 'FAILURE' };
    const reasons = evaluatePullRequest(pull({ statusCheckRollup: [status] }));
    expect(reasons.some((reason) => reason.includes('CI is not green') && reason.includes('legacy'))).toBe(true);
  });

  test('multiple: every failing condition is reported', () => {
    const reasons = evaluatePullRequest(
      pull({ state: 'CLOSED', mergeable: 'CONFLICTING', statusCheckRollup: [checkRun({ conclusion: 'FAILURE' })] }),
    );
    expect(reasons.length).toBeGreaterThanOrEqual(3);
  });
});
