import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { SidebarOption } from '../sidebar-option/sidebar-option';
import { SidebarSection } from '../sidebar-section/sidebar-section';
import { Sidebar } from './sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Sidebar>
        <SidebarSection title="Navigation" icon="compass">
          <SidebarOption label="Dashboard" active />
          <SidebarOption label="Settings" />
        </SidebarSection>
      </Sidebar>
    </SyntaxExample>
  ),
};
