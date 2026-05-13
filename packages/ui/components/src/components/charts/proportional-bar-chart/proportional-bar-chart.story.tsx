import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { ProportionalBarChart } from './proportional-bar-chart';

const meta: Meta<typeof ProportionalBarChart> = {
  title: 'Charts/Proportional Bar Chart',
  component: ProportionalBarChart,
};

export default meta;
type Story = StoryObj<typeof ProportionalBarChart>;

export const CostBreakdown: Story = {
  render: () => (
    <SyntaxExample>
      <ProportionalBarChart
        items={[
          { label: 'Input tokens', value: 0.0024, color: 'blue' },
          { label: 'Output tokens', value: 0.0012, color: 'green' },
          { label: 'Cache reads', value: 0.0003, color: 'amber' },
        ]}
      />
    </SyntaxExample>
  ),
};
