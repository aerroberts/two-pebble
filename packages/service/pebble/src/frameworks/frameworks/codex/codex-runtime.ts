import type { CodexOptions, Thread, ThreadEvent, ThreadOptions } from '@openai/codex-sdk';
import type { PebbleJsonRecord } from '../../../types';

export interface CodexAgentOptions {
  cwd?: string;
  pathToCodexExecutable: string;
  /**
   * Resume metadata previously published by this adapter. The adapter reads
   * `threadId` if it is a non-empty string and replays it via the SDK's
   * `resumeThread` factory. Other shapes are ignored so a stale or partial
   * blob can be tolerated.
   */
  resumeMetadata?: PebbleJsonRecord;
}

/**
 * Subset of the Codex SDK constructor options Pebble drives. Keyed to
 * `Pick<CodexOptions, ...>` so the surface tracks future SDK changes.
 */
export type CodexClientOptions = Pick<CodexOptions, 'codexPathOverride' | 'config' | 'env'>;

/**
 * Subset of Codex thread options Pebble drives per launch. Workspace path
 * routes to `workingDirectory`; `skipGitRepoCheck` lets the adapter operate
 * inside Pebble-managed worktrees that may not be a primary clone.
 */
export type CodexThreadOptions = Pick<
  ThreadOptions,
  | 'additionalDirectories'
  | 'approvalPolicy'
  | 'model'
  | 'modelReasoningEffort'
  | 'sandboxMode'
  | 'skipGitRepoCheck'
  | 'workingDirectory'
>;

export type CodexThreadEvent = ThreadEvent;
export type CodexThread = Thread;

export type InputStreamResolver = () => void;
