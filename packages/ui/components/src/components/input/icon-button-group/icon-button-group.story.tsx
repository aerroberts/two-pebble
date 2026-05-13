import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { IconButtonGroup } from './icon-button-group';

const meta: Meta<typeof IconButtonGroup> = {
  title: 'Input/Icon Button Group',
  component: IconButtonGroup,
};

export default meta;
type Story = StoryObj<typeof IconButtonGroup>;

const options = [
  { value: 'list', icon: 'list-tree' },
  { value: 'grid', icon: 'layout-dashboard' },
  { value: 'kanban', icon: 'folder-open' },
];

export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = useState('list');
    return (
      <SyntaxExample>
        <IconButtonGroup options={options} value={selected} onChange={setSelected} />
      </SyntaxExample>
    );
  },
};
