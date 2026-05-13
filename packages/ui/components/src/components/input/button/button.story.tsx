import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxExample } from '../../../storybook/syntax-example';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Input/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => (
    <SyntaxExample>
      <Button variant="primary">Click me</Button>
    </SyntaxExample>
  ),
};

export const Secondary: Story = {
  render: () => (
    <SyntaxExample>
      <Button variant="secondary">Click me</Button>
    </SyntaxExample>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <SyntaxExample>
      <div className="flex items-center gap-2">
        <Button variant="primary" leftIcon="box" rightIcon="arrow-right">
          Open console
        </Button>
        <Button variant="secondary" leftIcon="list-tree">
          View traces
        </Button>
      </div>
    </SyntaxExample>
  ),
};
