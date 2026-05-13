import type { Meta, StoryObj } from '@storybook/react';
import { ThreadSnapshotPage } from './thread-snapshot-page';

const meta: Meta<typeof ThreadSnapshotPage> = {
  component: ThreadSnapshotPage,
  title: 'Pages/Thread Snapshot Page',
};

export default meta;

type Story = StoryObj<typeof ThreadSnapshotPage>;

export const Snapshot: Story = {
  args: {
    orderId: 2,
    cells: [
      {
        orderId: 1,
        content: [{ type: 'text', content: { text: 'System prompt loaded.' } }],
        id: 'cell-1',
        label: 'System Prompt',
        role: 'system',
      },
      {
        orderId: 2,
        content: [{ type: 'text', content: { text: 'Tool definitions loaded.' } }],
        id: 'cell-2',
        label: 'Tool Registration: read_file',
        role: 'system',
      },
      {
        orderId: 3,
        content: [{ type: 'text', content: { text: 'User request' } }],
        id: 'cell-3',
        label: 'User Message',
        role: 'user',
      },
      {
        orderId: 4,
        content: [{ type: 'text', content: { text: 'Assistant response' } }],
        id: 'cell-4',
        label: 'Assistant Message',
        role: 'assistant',
      },
    ],
    onViewFullThread: () => undefined,
    status: 'ready',
  },
};
