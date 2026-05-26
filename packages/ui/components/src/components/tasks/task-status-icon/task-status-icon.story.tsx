import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { TaskStatusIcon } from './task-status-icon';
import type { TaskStatusIconStatus } from './types';

const meta: Meta<typeof TaskStatusIcon> = {
  title: 'Tasks/TaskStatusIcon',
  component: TaskStatusIcon,
};

export default meta;
type Story = StoryObj<typeof TaskStatusIcon>;

const ALL_STATUSES: TaskStatusIconStatus[] = [
  'blocked',
  'open',
  'working',
  'waiting',
  'success',
  'failure',
  'canceled',
];

export const AllStatuses: Story = {
  render: () => (
    <SyntaxExample>
      <div className="flex items-center gap-6">
        {ALL_STATUSES.map((status) => (
          <div key={status} className="flex flex-col items-center gap-2 text-xs text-content-muted">
            <TaskStatusIcon status={status} />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </SyntaxExample>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <SyntaxExample>
      <div className="flex items-center gap-6">
        <TaskStatusIcon status="working" size="sm" />
        <TaskStatusIcon status="working" size="md" />
        <TaskStatusIcon status="working" size="lg" />
      </div>
    </SyntaxExample>
  ),
};

export const Blocked: Story = {
  render: () => (
    <SyntaxExample>
      <TaskStatusIcon status="blocked" />
    </SyntaxExample>
  ),
};

export const Open: Story = {
  render: () => (
    <SyntaxExample>
      <TaskStatusIcon status="open" />
    </SyntaxExample>
  ),
};

export const Working: Story = {
  render: () => (
    <SyntaxExample>
      <TaskStatusIcon status="working" />
    </SyntaxExample>
  ),
};

export const Waiting: Story = {
  render: () => (
    <SyntaxExample>
      <TaskStatusIcon status="waiting" />
    </SyntaxExample>
  ),
};

export const Success: Story = {
  render: () => (
    <SyntaxExample>
      <TaskStatusIcon status="success" />
    </SyntaxExample>
  ),
};

export const Failure: Story = {
  render: () => (
    <SyntaxExample>
      <TaskStatusIcon status="failure" />
    </SyntaxExample>
  ),
};
