import type { Meta, StoryObj } from '@storybook/react';
import { Placeholder } from '../placeholder/placeholder';
import { SidebarLayout } from './sidebar-layout';

const meta: Meta<typeof SidebarLayout> = {
  title: 'Layout/Sidebar Layout',
  component: SidebarLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SidebarLayout>;

export const Default: Story = {
  args: {
    sidebar: <Placeholder label="Sidebar" tone="violet" minHeight="100%" />,
    children: <Placeholder label="Content" tone="blue" minHeight="100%" />,
  },
};
