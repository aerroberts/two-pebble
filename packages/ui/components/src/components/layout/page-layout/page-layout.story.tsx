import type { Meta, StoryObj } from '@storybook/react';
import { Placeholder } from '../placeholder/placeholder';
import { PageLayout } from './page-layout';

const meta: Meta<typeof PageLayout> = {
  title: 'Layout/Page Layout',
  component: PageLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PageLayout>;

export const Fixed: Story = {
  render: () => (
    <div className="flex h-screen min-h-0 flex-col">
      <PageLayout width="fixed">
        <Placeholder label="Fixed Width Content (1200px)" tone="blue" minHeight="100%" />
      </PageLayout>
    </div>
  ),
};

export const Full: Story = {
  render: () => (
    <div className="flex h-screen min-h-0 flex-col">
      <PageLayout width="full">
        <Placeholder label="Full Width Content" tone="emerald" minHeight="100%" />
      </PageLayout>
    </div>
  ),
};

export const Thin: Story = {
  render: () => (
    <div className="flex h-screen min-h-0 flex-col">
      <PageLayout width="thin">
        <Placeholder label="Thin Page Content (880px)" tone="violet" minHeight="100%" />
      </PageLayout>
    </div>
  ),
};
