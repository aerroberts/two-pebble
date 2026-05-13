import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { SidebarOption } from './sidebar-option';

const meta: Meta<typeof SidebarOption> = {
  title: 'Navigation/Sidebar Option',
  component: SidebarOption,
};

export default meta;
type Story = StoryObj<typeof SidebarOption>;

export const Default: Story = {
  render: () => (
    <>
      <SyntaxExample>
        <SidebarOption label="Dashboard" active />
      </SyntaxExample>
      <SyntaxExample>
        <SidebarOption label="Settings" />
      </SyntaxExample>
      <SyntaxExample>
        <SidebarOption label="Team" badge="3" />
      </SyntaxExample>
    </>
  ),
};
