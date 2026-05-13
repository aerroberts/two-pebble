import type { Meta, StoryObj } from '@storybook/react';
import { Placeholder } from './placeholder';

const meta: Meta<typeof Placeholder> = {
  title: 'Layout/Placeholder',
  component: Placeholder,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Placeholder>;

export const Default: Story = {
  args: {
    label: 'Content Area',
    tone: 'blue',
    minHeight: '300px',
  },
};
