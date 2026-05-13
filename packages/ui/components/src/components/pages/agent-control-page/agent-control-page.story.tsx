import type { Meta, StoryObj } from '@storybook/react';

import { AgentControlPage } from './agent-control-page';

const meta: Meta<typeof AgentControlPage> = {
  title: 'Pages/Agent Control Page',
  component: AgentControlPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AgentControlPage>;

export const Default: Story = {
  render: () => <AgentControlPage />,
};
