import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { CopyableValue } from './copyable-value';

const meta: Meta<typeof CopyableValue> = {
  title: 'Data/Copyable Value',
  component: CopyableValue,
};

export default meta;
type Story = StoryObj<typeof CopyableValue>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <CopyableValue value="identity-api" />
    </SyntaxExample>
  ),
};
