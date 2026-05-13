import { describe, expect, it } from 'bun:test';
import { Cell } from '../../thread';
import { SubAgentCapability } from './sub-agent-capability';

describe('feature: sub-agent capability registration', () => {
  it('happy: exposes configured sub-agent reference names to the model', () => {
    const tools = new SubAgentCapability().hookOnRegister({
      agents: [
        {
          agentRegistryId: 'agent-registries:research',
          description: 'Finds relevant implementation context.',
          name: 'researcher',
        },
      ],
    }).tools;

    const spawnTool = tools.find((tool) => tool.id === 'spawn-sub-agent');
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
  });

  it('happy: lists configured references and spawned child ids', async () => {
    const tools = new SubAgentCapability().hookOnRegister({
      agents: [
        {
          agentRegistryId: 'agent-registries:review',
          description: 'Reviews completed code changes.',
          name: 'reviewer',
        },
      ],
    }).tools;

    const listTool = tools.find((tool) => tool.id === 'list-sub-agents');
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
  });
});
