import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { SidebarOption } from '../sidebar-option/sidebar-option';
import { SidebarSection } from './sidebar-section';

const meta: Meta<typeof SidebarSection> = {
  title: 'Navigation/Sidebar Section',
  component: SidebarSection,
};

export default meta;
type Story = StoryObj<typeof SidebarSection>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <SidebarSection title="Settings">
        <SidebarOption label="General" />
        <SidebarOption label="Runtime" />
      </SidebarSection>
    </SyntaxExample>
  ),
};
