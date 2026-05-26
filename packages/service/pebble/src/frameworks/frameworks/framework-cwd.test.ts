import { describe, expect, it } from 'bun:test';
import { ClaudeCodeAgent } from './claude-code/claude-code-agent';
import type { QueryOptions } from './claude-code/claude-code-runtime';
import { CodexAgent } from './codex/codex-agent';
import type { CodexThreadOptions } from './codex/codex-runtime';

describe('feature: framework workspace cwd', () => {
  it('happy: claude code query options use the submitted workspace path as cwd', () => {
    const agent = new ClaudeCodeAgent({
      cwd: '/workspace/default',
      pathToClaudeCodeExecutable: '/usr/local/bin/claude',
    });
    const built = (
      agent as unknown as {
        buildQueryOptions(workspacePath: string, systemPrompt: string): { options: QueryOptions };
      }
    ).buildQueryOptions('/workspace/child', '');

    expect(built.options.cwd).toBe('/workspace/child');
  });

  it('happy: codex thread options use the submitted workspace path as workingDirectory', () => {
    const agent = new CodexAgent({
      cwd: '/workspace/default',
      pathToCodexExecutable: '/usr/local/bin/codex',
    });
    const options = (
      agent as unknown as {
        buildThreadOptions(workspacePath: string): CodexThreadOptions;
      }
    ).buildThreadOptions('/workspace/child');

    expect(options.workingDirectory).toBe('/workspace/child');
  });
});
