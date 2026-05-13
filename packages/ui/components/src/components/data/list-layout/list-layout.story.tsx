import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { ListLayout } from './list-layout';

const meta: Meta<typeof ListLayout> = {
  title: 'Data/List Layout',
  component: ListLayout,
};

export default meta;
type Story = StoryObj<typeof ListLayout>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <ListLayout
        items={[
          { icon: 'play', title: 'Run started', subtitle: 'agent-run-0042', value: 'now' },
          { icon: 'cpu', title: 'Model call completed', subtitle: 'gpt-5.4-mini', value: '820 ms' },
        ]}
      />
    </SyntaxExample>
  ),
};
