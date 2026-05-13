import type { Meta, StoryObj } from '@storybook/react';
import { Placeholder } from '../placeholder/placeholder';
import { InfoFooter } from './info-footer';

const meta: Meta<typeof InfoFooter> = {
  title: 'Layout/Info Footer',
  component: InfoFooter,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof InfoFooter>;

export const Default: Story = {
  render: () => (
    <div className="relative h-screen overflow-hidden bg-background">
      <Placeholder label="Screen content" tone="blue" minHeight="100%" />
      <InfoFooter
        leftItems={[
          {
            icon: 'list-tree',
            text: '12 traces',
            iconColor: 'text-info',
            onClick: () => undefined,
            textColor: 'text-content',
          },
          { icon: 'clock', text: '1m 42s elapsed' },
        ]}
        rightItems={[
          { icon: 'database', text: '8.2k tokens', iconColor: 'text-success', textColor: 'text-content' },
          { icon: 'dollar-sign', text: '$0.18' },
        ]}
      />
    </div>
  ),
};
