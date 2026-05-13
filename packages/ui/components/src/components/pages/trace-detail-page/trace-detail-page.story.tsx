import type { Meta, StoryObj } from '@storybook/react';

import { TraceDetailPage } from './trace-detail-page';

const meta: Meta<typeof TraceDetailPage> = {
  title: 'Pages/Trace Detail Page',
  component: TraceDetailPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TraceDetailPage>;

export const Default: Story = {
  render: () => <TraceDetailPage />,
};
