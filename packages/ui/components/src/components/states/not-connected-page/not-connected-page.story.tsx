import type { Meta, StoryObj } from '@storybook/react';

import { NotConnectedPage } from './not-connected-page';

const meta: Meta<typeof NotConnectedPage> = {
  title: 'States/Not Connected Page',
  component: NotConnectedPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof NotConnectedPage>;

export const Default: Story = {
  render: () => <NotConnectedPage disableReloadOnReconnect />,
};
