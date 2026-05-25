import { spawn } from 'node:child_process';
import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { WorkspaceAccessCapability } from '../../capability';
import bashToolDescription from '../../prompts/bash-tool-description.md?raw';

const MAX_OUTPUT_CHARS = 3000;
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_TIMEOUT_MS = 600_000;

const schema = z.object({
  command: z.string().describe('Shell command to run inside the workspace.'),
  description: z.string().optional().describe('Short one-line description of what the command does.'),
  timeoutMs: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(`Optional timeout in ms. Defaults to ${DEFAULT_TIMEOUT_MS}, capped at ${MAX_TIMEOUT_MS}.`),
});

export function buildBashTool(capability: WorkspaceAccessCapability) {
  return new NativeTool({
    description: bashToolDescription
      .replace('{{maxOutputChars}}', String(MAX_OUTPUT_CHARS))
      .replace('{{defaultTimeoutSeconds}}', String(DEFAULT_TIMEOUT_MS / 1000))
      .replace('{{maxTimeoutSeconds}}', String(MAX_TIMEOUT_MS / 1000)),
    name: 'bash',
    schema,
  }).onInvoke(async (input) => {
    const timeoutMs = Math.min(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS);
    const result = await runBash(input.command, capability.workspacePath(), timeoutMs);
    return ToolResponse.success([
      Cell.text(
        [
          `Exit code: ${result.exitCode}`,
          `Duration: ${result.durationMs}ms`,
          result.timedOut ? 'Timed out.' : null,
          result.stdout.length > 0 ? `stdout:\n${result.stdout}` : 'stdout: <empty>',
          result.stderr.length > 0 ? `stderr:\n${result.stderr}` : 'stderr: <empty>',
        ]
          .filter((line) => line !== null)
          .join('\n'),
      ),
    ]);
  });
}

interface BashResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timedOut: boolean;
}

function runBash(command: string, cwd: string, timeoutMs: number): Promise<BashResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn('/bin/sh', ['-c', command], { cwd });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', (chunk: Buffer) => {
      if (stdout.length < MAX_OUTPUT_CHARS) {
        stdout = appendCapped(stdout, chunk.toString('utf8'));
      }
    });
    child.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < MAX_OUTPUT_CHARS) {
        stderr = appendCapped(stderr, chunk.toString('utf8'));
      }
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code ?? -1,
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      stderr = appendCapped(stderr, `\nspawn error: ${error.message}`);
      resolve({
        stdout,
        stderr,
        exitCode: -1,
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
  });
}

function appendCapped(existing: string, addition: string): string {
  if (existing.length >= MAX_OUTPUT_CHARS) {
    return existing;
  }
  const remaining = MAX_OUTPUT_CHARS - existing.length;
  if (addition.length <= remaining) {
    return existing + addition;
  }
  return `${existing}${addition.slice(0, remaining)}\n…[truncated at ${MAX_OUTPUT_CHARS} chars]`;
}
