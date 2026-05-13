import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { RelativeTime } from './relative-time';

const meta: Meta<typeof RelativeTime> = {
  title: 'Data/Relative Time',
  component: RelativeTime,
};

export default meta;
type Story = StoryObj<typeof RelativeTime>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <RelativeTime date="2026-03-16T14:18:00Z" />
    </SyntaxExample>
  ),
};
