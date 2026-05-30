import { describe, expect, it } from 'bun:test';
import { ClaudeCodeAgent } from './claude-code/claude-code-agent';
import type { QueryOptions } from './claude-code/claude-code-runtime';
import { CodexAgent } from './codex/codex-agent';
import type { CodexClientOptions, CodexThreadOptions } from './codex/codex-runtime';

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

  it('happy: claude code disables native skills', () => {
    const agent = new ClaudeCodeAgent({
      cwd: '/workspace/default',
      pathToClaudeCodeExecutable: '/usr/local/bin/claude',
    });
    const built = (
      agent as unknown as {
        buildQueryOptions(workspacePath: string, systemPrompt: string): { options: QueryOptions };
      }
    ).buildQueryOptions('/workspace/child', '');

    expect(built.options.skills).toEqual([]);
    expect(built.options.settingSources).toEqual([]);
    expect(built.options.managedSettings).toEqual({ strictPluginOnlyCustomization: ['skills'] });
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

  it('happy: codex client options isolate native skills', () => {
    const agent = new CodexAgent({
      cwd: '/workspace/default',
      pathToCodexExecutable: '/usr/local/bin/codex',
    });
    const options = (
      agent as unknown as {
        buildClientOptions(pathToCodexExecutable: string): CodexClientOptions;
      }
    ).buildClientOptions('/usr/local/bin/codex');

    expect(options.codexPathOverride).toBe('/usr/local/bin/codex');
    expect(options.config).toEqual({
      features: {
        plugins: false,
        skill_mcp_dependency_install: false,
      },
      skills: {},
    });
    expect(options.env?.CODEX_HOME).toContain('two-pebble-codex-');
    expect(options.env?.CODEX_HOME).not.toBe(process.env.CODEX_HOME);
  });
});
