import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { TabSelect } from './tab-select';

const meta: Meta<typeof TabSelect> = {
  title: 'Input/Tab Select',
  component: TabSelect,
};

export default meta;
type Story = StoryObj<typeof TabSelect>;

const options = [
  { value: 'overview', label: 'Overview' },
  { value: 'usage', label: 'Usage' },
  { value: 'history', label: 'History' },
];

const optionsWithIcons = [
  { value: 'trace', label: 'Trace', icon: 'activity' },
  { value: 'cost', label: 'Cost', icon: 'coins' },
  { value: 'raw', label: 'Raw', icon: 'align-left' },
];

export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = useState('overview');
    return (
      <SyntaxExample>
        <TabSelect options={options} value={selected} onChange={setSelected} />
      </SyntaxExample>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [selected, setSelected] = useState('trace');
    return (
      <SyntaxExample>
        <TabSelect options={optionsWithIcons} value={selected} onChange={setSelected} />
      </SyntaxExample>
    );
  },
};
