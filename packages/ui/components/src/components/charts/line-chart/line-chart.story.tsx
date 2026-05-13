import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { LineChart } from './line-chart';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/Line Chart',
  component: LineChart,
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const baseTimestamp = Date.UTC(2026, 0, 1, 9, 0, 0);
const minute = 60_000;

const aggregatedSamples = Array.from({ length: 24 }, (_, index) => ({
  ts: baseTimestamp + index * minute,
  avg: 80 + Math.sin(index / 3) * 20 + index * 1.4,
  min: 50 + Math.sin(index / 2) * 10,
  max: 110 + Math.cos(index / 4) * 25 + index * 1.6,
}));

export const RequestLatency: Story = {
  render: () => (
    <SyntaxExample>
      <LineChart
        height={280}
        valueFormatter={(value) => `${value.toFixed(0)}ms`}
        series={[
          { id: 'avg', label: 'Average', color: 'blue' },
          { id: 'min', label: 'Min', color: 'green' },
          { id: 'max', label: 'Max', color: 'amber' },
        ]}
        points={aggregatedSamples.flatMap((sample) => [
          { timestamp: sample.ts, seriesId: 'avg', value: sample.avg },
          { timestamp: sample.ts, seriesId: 'min', value: sample.min },
          { timestamp: sample.ts, seriesId: 'max', value: sample.max },
        ])}
      />
    </SyntaxExample>
  ),
};

export const FilledArea: Story = {
  render: () => (
    <SyntaxExample>
      <LineChart
        height={220}
        filledArea
        showDots
        valueFormatter={(value) => value.toFixed(0)}
        series={[{ id: 'requests', label: 'Requests', color: 'purple' }]}
        points={aggregatedSamples.map((sample, index) => ({
          timestamp: sample.ts,
          seriesId: 'requests',
          value: 40 + Math.sin(index / 2) * 15 + index,
        }))}
      />
    </SyntaxExample>
  ),
};

export const Empty: Story = {
  render: () => (
    <SyntaxExample>
      <LineChart points={[]} emptyMessage="No samples in this window." />
    </SyntaxExample>
  ),
};
