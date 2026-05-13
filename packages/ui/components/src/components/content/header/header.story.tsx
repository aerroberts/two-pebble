import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxExample } from '../../../storybook/syntax-example';
import { Header } from './header';

const meta: Meta<typeof Header> = {
  title: 'Content/Header',
  component: Header,
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Header>Section Title</Header>
    </SyntaxExample>
  ),
};
