import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { TaskList, type TaskListPool, type TaskListTask } from './task-list';

const meta: Meta<typeof TaskList> = {
  title: 'Tasks/TaskList',
  component: TaskList,
};

export default meta;
type Story = StoryObj<typeof TaskList>;

const FLAT_TASKS: TaskListTask[] = [
  { id: 't1', name: 'Design schema', poolId: null, status: 'success' },
  { id: 't2', name: 'Run migration', poolId: null, status: 'working' },
  { id: 't3', name: 'Verify counts', poolId: null, status: 'blocked' },
];

const NESTED_POOLS: TaskListPool[] = [
  { id: 'epic', name: 'Migration epic', parentPoolId: null },
  { id: 'schema', name: 'Schema', parentPoolId: 'epic' },
  { id: 'backfill', name: 'Backfill', parentPoolId: 'epic' },
];

const NESTED_TASKS: TaskListTask[] = [
  { id: 'pre', name: 'Discovery', poolId: null, status: 'success' },
  { id: 'a', name: 'Add table', poolId: 'schema', status: 'success' },
  { id: 'b', name: 'Add columns', poolId: 'schema', status: 'working' },
  { id: 'c', name: 'Backfill batch 1', poolId: 'backfill', status: 'open' },
  { id: 'd', name: 'Backfill batch 2', poolId: 'backfill', status: 'blocked' },
  { id: 'post', name: 'Cutover', poolId: null, status: 'blocked' },
];

export const Flat: Story = {
  render: () => (
    <SyntaxExample>
      <div className="w-[360px] rounded-md border border-border bg-surface p-2">
        <TaskList tasks={FLAT_TASKS} pools={[]} />
      </div>
    </SyntaxExample>
  ),
};

export const FlatWithGhostRow: Story = {
  render: () => (
    <SyntaxExample>
      <div className="w-[360px] rounded-md border border-border bg-surface p-2">
        <TaskList
          tasks={FLAT_TASKS}
          pools={[]}
          onCreateTaskAfter={async () => 'ghost-created'}
          onRenameTask={() => {}}
        />
      </div>
    </SyntaxExample>
  ),
};

export const NestedFolders: Story = {
  render: () => (
    <SyntaxExample>
      <div className="w-[420px] rounded-md border border-border bg-surface p-2">
        <TaskList tasks={NESTED_TASKS} pools={NESTED_POOLS} />
      </div>
    </SyntaxExample>
  ),
};

export const Empty: Story = {
  render: () => (
    <SyntaxExample>
      <div className="w-[360px] rounded-md border border-border bg-surface p-2">
        <TaskList tasks={[]} pools={[]} emptyState="No tasks in this board yet." />
      </div>
    </SyntaxExample>
  ),
};

export const EmptyWithGhostRow: Story = {
  render: () => (
    <SyntaxExample>
      <div className="w-[360px] rounded-md border border-border bg-surface p-2">
        <TaskList tasks={[]} pools={[]} onCreateTaskAfter={async () => 'ghost-created'} onRenameTask={() => {}} />
      </div>
    </SyntaxExample>
  ),
};
