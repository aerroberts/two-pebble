import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Duration } from './duration';

const meta: Meta<typeof Duration> = {
  title: 'Data/Duration',
  component: Duration,
};

export default meta;
type Story = StoryObj<typeof Duration>;

export const FromStartEnd: Story = {
  render: () => (
    <SyntaxExample>
      <Duration start="2024-01-01T00:00:00Z" end="2024-01-01T02:30:00Z" />
    </SyntaxExample>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <SyntaxExample>
      <Duration start="2024-01-01T00:00:00Z" end="2024-01-01T02:30:00Z" prefix="ran for" />
    </SyntaxExample>
  ),
};

export const WithoutInfoIcon: Story = {
  render: () => (
    <SyntaxExample>
      <Duration compact hideInfoIcon start="2024-01-01T00:00:00Z" end="2024-01-01T02:30:00Z" />
    </SyntaxExample>
  ),
};
