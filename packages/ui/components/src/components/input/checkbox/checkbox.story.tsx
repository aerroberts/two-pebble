import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Input/Checkbox',
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Checkbox defaultChecked label="Accept terms" />
    </SyntaxExample>
  ),
};
