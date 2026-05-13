import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { DataValue } from './data-value';

const meta: Meta<typeof DataValue> = {
  title: 'Data/Data Value',
  component: DataValue,
};

export default meta;
type Story = StoryObj<typeof DataValue>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <DataValue icon="shield" title="SQL Injection" subtitle="/api/users" value="Critical" />
    </SyntaxExample>
  ),
};
