import { readFile } from 'node:fs/promises';
import type { AccountInfo, Options } from '@anthropic-ai/claude-agent-sdk';
import type { PebbleJsonRecord } from '../../../types';
import { parseTranscript } from './claude-code-trace-mapping';

export interface ClaudeCodeAgentOptions {
  cwd?: string;
  pathToClaudeCodeExecutable: string;
  /**
   * Resume metadata previously published by this adapter. The adapter reads
   * `sessionId` if it is a non-empty string and replays it via the SDK's
   * `resume` option. Other shapes are ignored so a stale or partial blob
   * can be tolerated.
   */
  resumeMetadata?: PebbleJsonRecord;
}

export type QueryOptions = Pick<
  Options,
  | 'allowDangerouslySkipPermissions'
  | 'cwd'
  | 'forwardSubagentText'
  | 'hooks'
  | 'pathToClaudeCodeExecutable'
  | 'permissionMode'
  | 'resume'
  | 'systemPrompt'
>;

export type QueryHooks = NonNullable<QueryOptions['hooks']>;

export type InputStreamResolver = () => void;
export type ApiProvider = AccountInfo['apiProvider'];

export interface ActiveClaudeCodeQuery {
  interrupt(): Promise<void>;
}

const TRANSCRIPT_READ_ATTEMPTS = 5;
const TRANSCRIPT_READ_DELAY_MS = 50;

/**
 * Maps the Claude Code account info provider tag onto the Pebble pricing
 * provider key. The SDK's `firstParty` value is Anthropic in disguise.
 */
export function mapApiProvider(apiProvider: ApiProvider): string {
  if (apiProvider === undefined || apiProvider === 'firstParty') return 'anthropic';
  return apiProvider;
}

/**
 * Reads a sub-agent transcript file. Polls a few times because Claude Code
 * sometimes flushes the transcript a beat after the SubagentStop hook
 * fires; without this the converter sees a partial JSONL stream.
 */
export async function readTranscriptWithRetry(path: string): Promise<string | undefined> {
  for (let attempt = 1; attempt <= TRANSCRIPT_READ_ATTEMPTS; attempt += 1) {
    const transcript = await readTranscriptFile(path);
    if (transcript !== undefined && isTranscriptComplete(transcript)) return transcript;
    if (attempt === TRANSCRIPT_READ_ATTEMPTS) return transcript;
    await delay(TRANSCRIPT_READ_DELAY_MS);
  }
  return undefined;
}

async function readTranscriptFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return undefined;
  }
}

function isTranscriptComplete(transcript: string): boolean {
  const data = parseTranscript(transcript);
  return data.status === 'failure' || data.output.length > 0;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
