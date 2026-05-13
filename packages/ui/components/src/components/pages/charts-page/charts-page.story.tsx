import type { Meta, StoryObj } from '@storybook/react';

import { ChartsPage } from './charts-page';

const meta: Meta<typeof ChartsPage> = {
  title: 'Pages/Charts Page',
  component: ChartsPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ChartsPage>;

export const Default: Story = {
  render: () => <ChartsPage />,
};
