import type { Meta, StoryObj } from '@storybook/react';

import { AccessDeniedPage } from './access-denied-page';

const meta: Meta<typeof AccessDeniedPage> = {
  title: 'States/Access Denied Page',
  component: AccessDeniedPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AccessDeniedPage>;

export const Default: Story = {
  render: () => <AccessDeniedPage />,
};
