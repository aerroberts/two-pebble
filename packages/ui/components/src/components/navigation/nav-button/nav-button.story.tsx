import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { NavButton } from './nav-button';

const meta: Meta<typeof NavButton> = {
  title: 'Navigation/Nav Button',
  component: NavButton,
};

export default meta;
type Story = StoryObj<typeof NavButton>;

export const Default: Story = {
  render: () => (
    <>
      <SyntaxExample>
        <NavButton label="Overview" active />
      </SyntaxExample>
      <SyntaxExample>
        <NavButton label="Settings" />
      </SyntaxExample>
    </>
  ),
};
