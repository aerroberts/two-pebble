import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Status, type StatusState } from './status';

const statusStates: StatusState[] = [
  'idle',
  'not-started',
  'in-progress',
  'failed',
  'success',
  'connected',
  'disconnected',
];

const meta: Meta<typeof Status> = {
  title: 'Content/Status',
  component: Status,
};

export default meta;
type Story = StoryObj<typeof Status>;

export const AllStates: Story = {
  render: () => (
    <>
      {statusStates.map((state) => (
        <SyntaxExample key={state}>
          <Status state={state} />
        </SyntaxExample>
      ))}
    </>
  ),
};

export const IconVariant: Story = {
  render: () => (
    <>
      {statusStates.map((state) => (
        <SyntaxExample key={state}>
          <Status state={state} variant="icon" />
        </SyntaxExample>
      ))}
    </>
  ),
};

export const IconVariantWithLabel: Story = {
  render: () => (
    <SyntaxExample>
      <Status state="connected" variant="icon" label="connected" />
    </SyntaxExample>
  ),
};
