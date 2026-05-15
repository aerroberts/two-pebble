import type { Meta, StoryObj } from '@storybook/react';
import { Cell } from '@two-pebble/pebble';
import { UserMessageTrace } from './user-message';

const meta: Meta<typeof UserMessageTrace> = {
  title: 'Agents/UserMessage',
  component: UserMessageTrace,
};

export default meta;
type Story = StoryObj<typeof UserMessageTrace>;

const base = Date.now();

export const PlainText: Story = {
  args: {
    trace: {
      id: 'trace-1',
      orderId: 1,
      createdAt: base,
      type: 'user-message',
      data: { content: [Cell.text('Hello there — please respond to my question.')] },
    },
    speakController: undefined,
  },
};

export const WithDocumentPill: Story = {
  args: {
    trace: {
      id: 'trace-2',
      orderId: 2,
      createdAt: base,
      type: 'user-message',
      data: {
        content: [
          Cell.text('Please review'),
          Cell.documentReference({
            documentId: 'doc-1',
            name: 'launch plan',
            contentSnapshot: '# Launch Plan\n\nDetails go here.',
            documentUpdatedAt: base,
          }),
          Cell.text('and tell me what is missing.'),
        ],
      },
    },
    speakController: undefined,
  },
};

export const WithDataGrid: Story = {
  args: {
    trace: {
      id: 'trace-3',
      orderId: 3,
      createdAt: base,
      type: 'user-message',
      data: {
        content: [
          Cell.text('Here are the numbers from yesterday:'),
          Cell.data({
            users: 412,
            revenue: 18920.55,
            churnRate: 0.012,
          }),
        ],
      },
    },
    speakController: undefined,
  },
};

export const WithCodeBlock: Story = {
  args: {
    trace: {
      id: 'trace-4',
      orderId: 4,
      createdAt: base,
      type: 'user-message',
      data: {
        content: [
          Cell.text('Reproduce the bug with this snippet:'),
          Cell.codeBlock('typescript', "const result = fetch('/api/users')\n  .then((res) => res.json());"),
        ],
      },
    },
    speakController: undefined,
  },
};
