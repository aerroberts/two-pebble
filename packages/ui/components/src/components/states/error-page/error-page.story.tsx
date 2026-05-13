import type { Meta, StoryObj } from '@storybook/react';

import { ErrorPage } from './error-page';

const meta: Meta<typeof ErrorPage> = {
  title: 'States/Error Page',
  component: ErrorPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ErrorPage>;

export const Default: Story = {
  render: () => <ErrorPage />,
};

export const WithErrorMessage: Story = {
  render: () => (
    <ErrorPage
      errorMessage={
        'TypeError: Cannot read properties of undefined (reading "agentId")\n' +
        '    at launchAgent (/src/operations/agent.launch.operation.ts:42:18)\n' +
        '    at TwoPebbleDaemon.handleOperation (/src/two-pebble-daemon.ts:162:24)\n' +
        '    at WebSocketConnection.dispatch (/src/ws-bridge/connection.ts:88:11)\n' +
        'Caused by: selected inference profile did not include a provider integration id'
      }
    />
  ),
};
