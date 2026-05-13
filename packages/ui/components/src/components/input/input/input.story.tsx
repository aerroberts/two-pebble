import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Input/Input',
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => (
    <>
      <SyntaxExample>
        <Input placeholder="Enter a value" />
      </SyntaxExample>
      <SyntaxExample>
        <Input label="Email" placeholder="you@example.com" leadingIcon="mail" />
      </SyntaxExample>
      <SyntaxExample>
        <Input placeholder="Search..." leadingIcon="search" action={{ icon: 'arrow-right', onClick: () => {} }} />
      </SyntaxExample>
    </>
  ),
};
