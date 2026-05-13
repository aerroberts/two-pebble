import type { Meta, StoryObj } from '@storybook/react';

import { Placeholder } from '../placeholder/placeholder';
import { WorkbenchPageLayout } from './workbench-page-layout';

const meta: Meta<typeof WorkbenchPageLayout> = {
  title: 'Layout/WorkbenchPageLayout',
  component: WorkbenchPageLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof WorkbenchPageLayout>;

export const Default: Story = {
  render: () => (
    <div className="h-screen min-h-0">
      <WorkbenchPageLayout header={<Placeholder label="Header" tone="amber" minHeight="2.5rem" />}>
        <Placeholder label="Workbench body" tone="blue" minHeight="100%" />
      </WorkbenchPageLayout>
    </div>
  ),
};
