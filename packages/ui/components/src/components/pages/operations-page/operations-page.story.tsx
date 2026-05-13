import type { Meta, StoryObj } from '@storybook/react';

import { OperationsPage } from './operations-page';

const meta: Meta<typeof OperationsPage> = {
  title: 'Pages/Operations Page',
  component: OperationsPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof OperationsPage>;

export const Default: Story = {
  render: () => <OperationsPage />,
};
