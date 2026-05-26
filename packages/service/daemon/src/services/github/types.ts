import type { GithubHeartbeatDetail, TrackedPrCheckRun, TrackedPrState } from '@two-pebble/protocol';

export type { GithubHeartbeatDetail, TrackedPrCheckRun, TrackedPrState };

export interface ParsedGithubPrUrl {
  repo: string;
  number: number;
}
