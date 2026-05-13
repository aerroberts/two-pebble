import type { Meta, StoryObj } from '@storybook/react';

import { NotFoundPage } from './not-found-page';

const meta: Meta<typeof NotFoundPage> = {
  title: 'States/Not Found Page',
  component: NotFoundPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof NotFoundPage>;

export const Default: Story = {
  render: () => <NotFoundPage />,
};
