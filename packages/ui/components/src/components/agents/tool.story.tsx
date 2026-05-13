import type { Meta, StoryObj } from '@storybook/react';
import { Cell } from '@two-pebble/pebble';
import { AgentTrace } from './agent-trace';
import { renderTraceStory, traceBaseTime } from './story-utils';
import { ToolTrace } from './tool';
import type { AgentTraceRecord } from './types';

const meta: Meta<typeof ToolTrace> = {
  title: 'Agents/Tool',
  component: ToolTrace,
};

export default meta;
type Story = StoryObj<typeof ToolTrace>;

export const Default: Story = {
  render: () =>
    renderTraceStory({
      id: 'trace-tool',
      orderId: 1,
      createdAt: traceBaseTime,
      type: 'tool',
      data: {
        duration: 32,
        input: { message: 'hello' },
        result: [Cell.data({ message: 'hello' })],
        source: 'native',
        status: 'success',
        toolCallId: 'tool-1',
        toolId: 'echo',
      },
    }),
};

const mergedToolTraces: AgentTraceRecord[] = [
  {
    id: 'trace-tool-read',
    orderId: 1,
    createdAt: traceBaseTime,
    type: 'tool',
    data: {
      duration: 18,
      input: { path: 'packages/ui/components/src/components/agents/tool.tsx' },
      result: [Cell.data({ bytes: 842, lines: 27 })],
      source: 'cli',
      status: 'success',
      toolCallId: 'tool-read',
      toolId: 'read-file',
    },
  },
  {
    id: 'trace-tool-search',
    orderId: 2,
    createdAt: traceBaseTime + 6,
    type: 'tool',
    data: {
      duration: 25,
      input: { pattern: 'TraceBodyCell', path: 'packages/ui/components/src/components/agents' },
      result: [Cell.data({ matches: 7 })],
      source: 'framework',
      status: 'success',
      toolCallId: 'tool-search',
      toolId: 'spawn-agent',
    },
  },
  {
    id: 'trace-tool-edit',
    orderId: 3,
    createdAt: traceBaseTime + 12,
    type: 'tool',
    data: {
      duration: 41,
      input: { file: 'tool.story.tsx', operation: 'insert-story' },
      result: [Cell.text('Story updated.')],
      source: 'native',
      status: 'success',
      toolCallId: 'tool-edit',
      toolId: 'apply-patch',
    },
  },
];

export const MergedTools: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-background p-6">
      <AgentTrace traces={mergedToolTraces} />
    </div>
  ),
};
