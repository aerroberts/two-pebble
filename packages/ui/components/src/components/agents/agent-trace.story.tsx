import type { Meta, StoryObj } from '@storybook/react';
import { Cell } from '@two-pebble/pebble';
import { AgentTrace } from './agent-trace';
import type { AgentTraceRecord } from './types';

const meta: Meta<typeof AgentTrace> = {
  title: 'Agents/Trace',
  component: AgentTrace,
};

export default meta;
type Story = StoryObj<typeof AgentTrace>;

const base = Date.now();

const traces: AgentTraceRecord[] = [
  {
    id: 'trace-system-message',
    orderId: 1,
    createdAt: base,
    type: 'system-message',
    data: { content: [Cell.text('System prompt loaded')] },
  },
  {
    id: 'trace-capability-register',
    orderId: 2,
    createdAt: base + 10,
    type: 'capability-register',
    data: {
      capabilityId: 'messenger',
      description: 'Sets message state',
      name: 'messenger',
      tools: [
        {
          description: 'Set message state',
          example: [Cell.codeBlock('xml', '<set_message_state>hello</set_message_state>')],
          name: 'set_message_state',
          type: 'native',
        },
        {
          description: 'Persist message state through the CLI bridge.',
          example: [Cell.codeBlock('bash', 'pebble message persist --id message')],
          name: 'persist-message-state',
          type: 'cli',
        },
        {
          description: 'Ask a framework agent to summarize the active message queue.',
          example: [Cell.data({ queue: 'message-state' })],
          name: 'summarize-message-state',
          type: 'framework',
        },
      ],
    },
  },
  {
    id: 'trace-user-message',
    orderId: 3,
    createdAt: base + 20,
    type: 'user-message',
    data: { content: [Cell.text('Please set the message state.')] },
  },
  {
    id: 'trace-turn-start',
    orderId: 4,
    createdAt: base + 30,
    type: 'turn-start',
    data: { step: 1, totalSteps: 4 },
  },
  {
    id: 'trace-model-call-start',
    orderId: 5,
    createdAt: base + 40,
    type: 'model-call-start',
    data: {
      modelCallId: 'model-call-001',
      modelId: 'gpt-5.4-mini',
      provider: 'openai',
      threadCursor: 'thread-story/4',
    },
  },
  {
    id: 'trace-model-call-success',
    orderId: 6,
    createdAt: base + 60,
    type: 'model-call-success',
    data: { modelCallId: 'model-call-001' },
  },
  {
    id: 'trace-assistant-message',
    orderId: 7,
    createdAt: base + 65,
    type: 'assistant-message',
    data: { content: [Cell.text('State has been set.')] },
  },
  {
    id: 'trace-tool-call-start-categorize',
    orderId: 8,
    createdAt: base + 66,
    type: 'tool-call-start',
    data: {
      callId: 'tool-call-categorize',
      input: { issue: 'suspicious prompt' },
      source: 'framework',
      toolId: 'categorize-exploit',
    },
  },
  {
    id: 'trace-tool-call-success-categorize',
    orderId: 9,
    createdAt: base + 67,
    type: 'tool-call-success',
    data: {
      result: [Cell.data({ category: 'none', confidence: 0.94 })],
      toolCallId: 'tool-call-categorize',
    },
  },
  {
    id: 'trace-tool-call-start-complete',
    orderId: 10,
    createdAt: base + 68,
    type: 'tool-call-start',
    data: {
      callId: 'tool-call-complete',
      input: { taskId: 'task-1' },
      source: 'native',
      toolId: 'mark-task-complete',
    },
  },
  {
    id: 'trace-tool-call-success-complete',
    orderId: 11,
    createdAt: base + 69,
    type: 'tool-call-success',
    data: {
      result: [Cell.data({ status: 'complete' })],
      toolCallId: 'tool-call-complete',
    },
  },
  {
    id: 'trace-conversation-thread-snapshot',
    orderId: 12,
    createdAt: base + 70,
    type: 'conversation-thread-snapshot',
    data: { threadCursor: 'thread-story/8' },
  },
  {
    id: 'trace-agent-success',
    orderId: 13,
    createdAt: base + 80,
    type: 'agent-success',
    data: { content: [Cell.text('Completed after 1 steps.')] },
  },
];

const mergedToolTraces: AgentTraceRecord[] = [
  {
    id: 'trace-merged-tool-read',
    orderId: 1,
    createdAt: base,
    type: 'tool',
    data: {
      duration: 16,
      input: { path: 'src/routes/trace-detail.tsx' },
      result: [Cell.data({ bytes: 2104, lines: 86 })],
      source: 'cli',
      status: 'success',
      toolCallId: 'merged-tool-read',
      toolId: 'read-file',
    },
  },
  {
    id: 'trace-merged-tool-search',
    orderId: 2,
    createdAt: base + 4,
    type: 'tool',
    data: {
      duration: 29,
      input: { query: 'agent trace grouping' },
      result: [Cell.data({ matches: ['agent-trace.tsx', 'tool-trace-group.tsx'] })],
      source: 'framework',
      status: 'success',
      toolCallId: 'merged-tool-search',
      toolId: 'spawn-agent',
    },
  },
  {
    id: 'trace-merged-tool-apply',
    orderId: 3,
    createdAt: base + 9,
    type: 'tool',
    data: {
      duration: 37,
      input: { files: ['agent-trace.story.tsx'], summary: 'Add merged tool example' },
      result: [Cell.text('Applied patch successfully.')],
      source: 'native',
      status: 'success',
      toolCallId: 'merged-tool-apply',
      toolId: 'apply-patch',
    },
  },
];

export const Default: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-background p-6">
      <AgentTrace traces={traces} />
    </div>
  ),
};

export const MergedTools: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-background p-6">
      <AgentTrace traces={mergedToolTraces} />
    </div>
  ),
};
