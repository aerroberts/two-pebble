import type { TrackedPrCheckRun, TrackedPrRecord, TrackedPrState } from '@two-pebble/datastore';

export type BackoffEntry = {
  attempt: number;
  until: number;
};

export type PollOutcome =
  | { kind: 'transition'; row: TrackedPrRecord; next: TrackedPrState; checks: TrackedPrCheckRun[]; title: string }
  | { kind: 'error'; prId: string; status: number; message: string };

export type GithubHeartbeatDetail = {
  polled: number;
  transitioned: number;
  prUpdates: { prId: string; from: TrackedPrState; to: TrackedPrState; checks: TrackedPrCheckRun[] }[];
  errors: { prId: string; status: number; message: string }[];
};
