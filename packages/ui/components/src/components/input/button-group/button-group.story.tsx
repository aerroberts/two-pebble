import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { ButtonGroup } from './button-group';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Input/Button Group',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = useState('day');
    return (
      <SyntaxExample>
        <ButtonGroup options={options} value={selected} onChange={setSelected} />
      </SyntaxExample>
    );
  },
};
