import type { TrackedPrCheckRun, TrackedPrRecord, TrackedPrState } from '@two-pebble/datastore';

export type BackoffEntry = {
  attempt: number;
  until: number;
};

export type PollOutcome =
  | { kind: 'not-modified'; prId: string }
  | { kind: 'transition'; row: TrackedPrRecord; next: TrackedPrState; checks: TrackedPrCheckRun[]; etag: string | null }
  | { kind: 'error'; prId: string; status: number; message: string };

export type GithubHeartbeatDetail = {
  polled: number;
  transitioned: number;
  prUpdates: { prId: string; from: TrackedPrState; to: TrackedPrState; checks: TrackedPrCheckRun[] }[];
  errors: { prId: string; status: number; message: string }[];
};

export type GithubPullResponse = {
  head: { sha: string };
  mergeable: boolean | null;
  mergeable_state: string;
  merged: boolean;
  state: 'open' | 'closed';
};

export type GithubChecksResponse = {
  check_runs: Array<{
    conclusion: string | null;
    html_url: string;
    name: string;
    status: string;
  }>;
};
