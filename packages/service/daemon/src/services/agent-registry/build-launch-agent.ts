import type { Agent } from '@two-pebble/pebble';
import { FrameworkAgent, PebbleAgent, ProviderFactory } from '@two-pebble/pebble';
import { ClaudeCodeAgent, CodexAgent, type ThirdPartyAgentFramework } from '@two-pebble/pebble/frameworks';
import type { BuildLaunchAgentInput, BuildLaunchAgentInput_Framework } from './types';

/**
 * Builds the runtime agent implementation for one launch request.
 * Framework registries (e.g. Claude Code) run through the framework adapter
 * using the third-party agent install's executable path; pebble registries
 * use PebbleAgent. Capability registration is done by the orchestrator
 * after construction so the same builder serves fresh launches and rehydrate.
 */
export function buildLaunchAgent(input: BuildLaunchAgentInput): Agent {
  if (input.kind === 'framework') {
    return new FrameworkAgent({
      agentId: input.agentId,
      bridge: input.bridge,
      description: input.description,
      framework: buildFrameworkAdapter(input),
      freshLaunch: Object.keys(input.resumeMetadata).length === 0,
      name: input.registry.name,
      systemPrompt: input.systemPrompt,
      workspacePath: input.workspacePath,
    });
  }

  const providerFactory = new ProviderFactory();
  const provider = providerFactory.buildProvider(input.integration, input.inferenceProfile);
  return new PebbleAgent({
    agentId: input.agentId,
    bridge: input.bridge,
    description: input.description,
    name: input.registry.name,
    provider,
    systemPrompt: input.systemPrompt,
    workspacePath: input.workspacePath,
    ...(input.restoredThread === undefined ? {} : { restoredThread: input.restoredThread }),
  });
}

function buildFrameworkAdapter(input: BuildLaunchAgentInput_Framework): ThirdPartyAgentFramework {
  if (input.install.frameworkId === 'claude-code') {
    return new ClaudeCodeAgent({
      cwd: input.workspacePath,
      pathToClaudeCodeExecutable: input.install.data.executablePath,
      resumeMetadata: input.resumeMetadata,
    });
  }
  if (input.install.frameworkId === 'codex') {
    return new CodexAgent({
      cwd: input.workspacePath,
      pathToCodexExecutable: input.install.data.executablePath,
      resumeMetadata: input.resumeMetadata,
    });
  }
  throw new Error(`Unsupported third-party agent framework: ${(input.install as { frameworkId: string }).frameworkId}`);
}
