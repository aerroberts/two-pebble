import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { SidebarOption } from '../sidebar-option/sidebar-option';
import { SidebarSubitem } from './sidebar-subitem';

const meta: Meta<typeof SidebarSubitem> = {
  title: 'Navigation/Sidebar Subitem',
  component: SidebarSubitem,
};

export default meta;
type Story = StoryObj<typeof SidebarSubitem>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <SidebarOption label="Parent agent" active />
      <SidebarSubitem label="Child agent" />
      <SidebarSubitem active label="Selected child" />
    </SyntaxExample>
  ),
};
