import type { Meta, StoryObj } from '@storybook/react';

import { LoadingPage } from './loading-page';

const meta: Meta<typeof LoadingPage> = {
  title: 'States/Loading Page',
  component: LoadingPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof LoadingPage>;

export const Default: Story = {
  render: () => <LoadingPage />,
};
