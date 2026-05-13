import type { Meta, StoryObj } from '@storybook/react';
import { Cell } from '@two-pebble/pebble';
import { SubAgentTrace } from './sub-agent';
import type { AgentTraceByType } from './types';

const meta: Meta<typeof SubAgentTrace> = {
  title: 'Agents/Sub Agent',
  component: SubAgentTrace,
};

export default meta;
type Story = StoryObj<typeof SubAgentTrace>;

const trace: AgentTraceByType<'sub-agent'> = {
  createdAt: Date.now(),
  id: 'trace-sub-agent',
  orderId: 1,
  type: 'sub-agent',
  data: {
    agentInstanceId: 'agent-abc123',
    agentTemplateId: 'general-purpose',
    input: [Cell.text('Inspect the pricing path and report what changed.')],
    output: [Cell.text('The pricing path now records Claude Code sub-agent usage.')],
    status: 'success',
  },
};

export const Default: Story = {
  args: {
    trace,
  },
};
