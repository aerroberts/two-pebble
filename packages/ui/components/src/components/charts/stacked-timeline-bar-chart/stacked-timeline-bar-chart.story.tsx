import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { StackedTimelineBarChart } from './stacked-timeline-bar-chart';

const meta: Meta<typeof StackedTimelineBarChart> = {
  title: 'Charts/Stacked Timeline Bar Chart',
  component: StackedTimelineBarChart,
};

export default meta;
type Story = StoryObj<typeof StackedTimelineBarChart>;

export const CostTimeline: Story = {
  render: () => (
    <SyntaxExample>
      <StackedTimelineBarChart
        points={[
          { timestamp: 0, seriesId: 'Input tokens', value: 0.0012 },
          { timestamp: 2000, seriesId: 'Output tokens', value: 0.0008 },
          { timestamp: 4000, seriesId: 'Input tokens', value: 0.0015 },
          { timestamp: 6000, seriesId: 'Cache reads', value: 0.0003 },
          { timestamp: 9000, seriesId: 'Output tokens', value: 0.0011 },
        ]}
        series={[
          { id: 'Input tokens', label: 'Input tokens', color: 'blue' },
          { id: 'Output tokens', label: 'Output tokens', color: 'green' },
          { id: 'Cache reads', label: 'Cache reads', color: 'amber' },
        ]}
        valueFormatter={(value) => `$${value.toFixed(4)}`}
      />
    </SyntaxExample>
  ),
};
