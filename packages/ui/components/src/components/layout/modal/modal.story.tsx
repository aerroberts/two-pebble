import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Placeholder } from '../placeholder/placeholder';
import { Modal } from './modal';

const meta: Meta<typeof Modal> = {
  title: 'Layout/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    open: true,
    children: <Placeholder label="Modal Content" tone="rose" minHeight="200px" />,
  },
};
