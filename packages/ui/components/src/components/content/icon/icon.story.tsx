import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxExample } from '../../../storybook/syntax-example';
import { Icon } from './icon';

const meta: Meta<typeof Icon> = {
  title: 'Content/Icon',
  component: Icon,
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Icon name="settings" />
    </SyntaxExample>
  ),
};

export const Accent: Story = {
  render: () => (
    <SyntaxExample>
      <Icon name="alert-circle" color="text-danger" />
    </SyntaxExample>
  ),
};

export const Success: Story = {
  render: () => (
    <SyntaxExample>
      <Icon name="check" color="text-accent" />
    </SyntaxExample>
  ),
};
