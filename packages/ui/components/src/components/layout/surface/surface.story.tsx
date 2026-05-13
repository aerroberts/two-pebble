import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Surface } from './surface';

const meta: Meta<typeof Surface> = {
  title: 'Layout/Surface',
  component: Surface,
};

export default meta;
type Story = StoryObj<typeof Surface>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Surface>An inset content block with the standard surface background and padding.</Surface>
    </SyntaxExample>
  ),
};
