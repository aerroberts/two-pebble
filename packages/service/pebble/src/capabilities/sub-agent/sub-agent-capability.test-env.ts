import { expect } from 'bun:test';
import { Cell } from '../../thread';
import { SubAgentCapability } from './sub-agent-capability';

export function subAgentToolsForResearcher() {
  return new SubAgentCapability().hookOnRegister({
    agents: [
      {
        agentRegistryId: 'agent-registries:research',
        description: 'Finds relevant implementation context.',
        name: 'researcher',
      },
    ],
  }).tools;
}

export function subAgentToolsForReviewer() {
  return new SubAgentCapability().hookOnRegister({
    agents: [
      {
        agentRegistryId: 'agent-registries:review',
        description: 'Reviews completed code changes.',
        name: 'reviewer',
      },
    ],
  }).tools;
}

export function expectResearcherSpawnRegistration(): void {
  const spawnTool = subAgentToolsForResearcher().find((tool) => tool.id === 'spawn-sub-agent');
  const registration = spawnTool?.describe()[0];
  expect(registration).toMatchObject({
    type: 'toolRegistration',
    content: {
      description:
        'Spawn a child agent by configured reference name and send its initial message. Valid reference names: researcher - Finds relevant implementation context.',
      name: 'spawn-sub-agent',
      toolType: 'native',
    },
  });
  expect(registration).toHaveProperty('content.inputSchema.properties.referenceName.enum', ['researcher']);
}

export async function expectReviewerListOutput(): Promise<void> {
  const listTool = subAgentToolsForReviewer().find((tool) => tool.id === 'list-sub-agents');
  const result = await listTool?.invoke({});
  expect(result).toMatchObject({
    status: 'success',
    content: [
      Cell.header2('Configured sub-agents'),
      Cell.text('reviewer - Reviews completed code changes.'),
      Cell.header2('Spawned child agents'),
      Cell.text('No spawned child agents.'),
    ],
  });
}
