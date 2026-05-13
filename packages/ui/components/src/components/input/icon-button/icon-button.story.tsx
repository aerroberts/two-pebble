import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { IconButton } from './icon-button';

const meta: Meta<typeof IconButton> = {
  title: 'Input/Icon Button',
  component: IconButton,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {
  render: () => (
    <SyntaxExample>
      <IconButton icon="settings" aria-label="Open settings" />
    </SyntaxExample>
  ),
};

export const Secondary: Story = {
  render: () => (
    <SyntaxExample>
      <IconButton icon="plus" variant="secondary" aria-label="Add item" />
    </SyntaxExample>
  ),
};
