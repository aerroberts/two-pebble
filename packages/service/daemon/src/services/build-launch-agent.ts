import type { Agent } from '@two-pebble/pebble';
import { FrameworkAgent, PebbleAgent, ProviderFactory, renderAgentNamingInstruction } from '@two-pebble/pebble';
import { ClaudeCodeAgent } from '@two-pebble/pebble/frameworks';
import type { BuildLaunchAgentInput } from './agent-registry-types';

/**
 * Builds the runtime agent implementation for one launch request.
 * Framework registries (e.g. Claude Code) run through the framework adapter
 * using the third-party agent install's executable path; pebble registries
 * use PebbleAgent. Capability registration is done by the orchestrator
 * after construction so the same builder serves fresh launches and rehydrate.
 */
export function buildLaunchAgent(input: BuildLaunchAgentInput): Agent {
  if (input.kind === 'framework') {
    if (input.install.frameworkId !== 'claude-code') {
      throw new Error(`Unsupported third-party agent framework: ${input.install.frameworkId}`);
    }
    return new FrameworkAgent({
      agentId: input.agentId,
      description: input.description,
      framework: new ClaudeCodeAgent({
        cwd: input.workspacePath,
        pathToClaudeCodeExecutable: input.install.data.executablePath,
        resumeMetadata: input.resumeMetadata,
      }),
      freshLaunch: Object.keys(input.resumeMetadata).length === 0,
      name: input.registry.name,
      systemPrompt: composeFrameworkSystemPrompt(input.agentId, input.registry.systemPrompt),
      workspacePath: input.workspacePath,
    });
  }

  const providerFactory = new ProviderFactory();
  const provider = providerFactory.buildProvider(input.integration, input.inferenceProfile);
  return new PebbleAgent({
    agentId: input.agentId,
    description: input.description,
    name: input.registry.name,
    provider,
    systemPrompt: input.registry.systemPrompt,
    workspacePath: input.workspacePath,
    ...(input.restoredThread === undefined ? {} : { restoredThread: input.restoredThread }),
  });
}

function composeFrameworkSystemPrompt(agentId: string, registrySystemPrompt: string): string {
  const naming = renderAgentNamingInstruction(agentId);
  if (registrySystemPrompt.length === 0) {
    return naming;
  }
  return `${naming}\n\n${registrySystemPrompt}`;
}
