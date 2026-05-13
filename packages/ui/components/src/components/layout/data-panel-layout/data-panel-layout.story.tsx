import type { Meta, StoryObj } from '@storybook/react';

import { Placeholder } from '../placeholder/placeholder';
import { DataPanelLayout } from './data-panel-layout';

const meta: Meta<typeof DataPanelLayout> = {
  title: 'Layout/Data Panel Layout',
  component: DataPanelLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DataPanelLayout>;

export const Default: Story = {
  render: () => (
    <div className="h-screen min-h-0">
      <DataPanelLayout open panel={<Placeholder label="Data Panel" tone="violet" minHeight="calc(100vh - 1.25rem)" />}>
        <Placeholder label="Main Content" tone="blue" minHeight="100%" />
      </DataPanelLayout>
    </div>
  ),
};
