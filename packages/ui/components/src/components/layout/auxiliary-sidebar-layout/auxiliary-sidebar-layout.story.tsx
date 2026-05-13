import type { Meta, StoryObj } from '@storybook/react';

import { Placeholder } from '../placeholder/placeholder';
import { AuxiliarySidebarLayout } from './auxiliary-sidebar-layout';

const meta: Meta<typeof AuxiliarySidebarLayout> = {
  title: 'Layout/Auxiliary Sidebar Layout',
  component: AuxiliarySidebarLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AuxiliarySidebarLayout>;

export const Default: Story = {
  args: {
    sidebar: <Placeholder label="Auxiliary sidebar" tone="neutral" minHeight="100%" />,
    children: <Placeholder label="Auxiliary content" tone="blue" minHeight="100vh" />,
  },
};
