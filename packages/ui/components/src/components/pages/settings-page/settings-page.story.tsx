import type { Meta, StoryObj } from '@storybook/react';

import { SettingsPage } from './settings-page';

const meta: Meta<typeof SettingsPage> = {
  title: 'Pages/Settings Page',
  component: SettingsPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SettingsPage>;

export const Default: Story = {
  render: () => <SettingsPage />,
};
