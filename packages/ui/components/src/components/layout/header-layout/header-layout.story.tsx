import type { Meta, StoryObj } from '@storybook/react';
import { Placeholder } from '../placeholder/placeholder';
import { HeaderLayout } from './header-layout';

const meta: Meta<typeof HeaderLayout> = {
  title: 'Layout/Header Layout',
  component: HeaderLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HeaderLayout>;

export const Default: Story = {
  args: {
    header: <Placeholder label="Header" tone="amber" minHeight="56px" />,
    children: <Placeholder label="Content" tone="blue" minHeight="100%" />,
  },
};
