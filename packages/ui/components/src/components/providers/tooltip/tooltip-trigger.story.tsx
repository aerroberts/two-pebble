import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Button } from '../../input/button/button';
import { Tooltip } from './tooltip-trigger';

const meta: Meta<typeof Tooltip> = {
  title: 'Providers/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Tooltip content="Save your changes">
        <Button>Hover me</Button>
      </Tooltip>
    </SyntaxExample>
  ),
};

export const Open: Story = {
  render: () => (
    <SyntaxExample>
      <Tooltip defaultOpen side="right" data={{ Provider: 'OpenAI', Status: 'Connected', Latency: '84 ms' }}>
        <Button leftIcon="info" variant="secondary">
          Runtime settings
        </Button>
      </Tooltip>
    </SyntaxExample>
  ),
};
