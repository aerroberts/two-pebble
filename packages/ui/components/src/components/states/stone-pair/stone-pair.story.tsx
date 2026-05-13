import type { Meta, StoryObj } from '@storybook/react';

import { StonePair } from './stone-pair';

const meta: Meta<typeof StonePair> = {
  title: 'States/Stone Pair',
  component: StonePair,
};

export default meta;
type Story = StoryObj<typeof StonePair>;

export const Default: Story = {
  render: () => <StonePair />,
};
