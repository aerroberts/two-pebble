import type { Meta, StoryObj } from '@storybook/react';

import { TaskGraph } from './task-graph';
import {
  ALL_STATUSES_INPUT,
  COMPLEX_INPUT,
  CROSS_POOL_INPUT,
  DEEPLY_NESTED_INPUT,
  HUGE_INPUT,
  PARALLEL_DEPS_INPUT,
  SIMPLE_CHAIN_INPUT,
  SINGLE_POOL_INPUT,
} from './task-graph.story-fixtures';

const meta: Meta<typeof TaskGraph> = {
  title: 'Tasks/TaskGraph',
  component: TaskGraph,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TaskGraph>;

export const SimpleChain: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={SIMPLE_CHAIN_INPUT} />
    </div>
  ),
};

export const ParallelDependencies: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={PARALLEL_DEPS_INPUT} />
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={ALL_STATUSES_INPUT} />
    </div>
  ),
};

export const SinglePool: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={SINGLE_POOL_INPUT} />
    </div>
  ),
};

export const DeeplyNested: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={DEEPLY_NESTED_INPUT} />
    </div>
  ),
};

export const CrossPoolSiblings: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={CROSS_POOL_INPUT} />
    </div>
  ),
};

export const Complex: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={COMPLEX_INPUT} />
    </div>
  ),
};

export const Huge: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <TaskGraph graph={HUGE_INPUT} />
    </div>
  ),
};
