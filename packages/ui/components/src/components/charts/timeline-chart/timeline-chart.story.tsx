import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { TimelineChart } from './timeline-chart';

const meta: Meta<typeof TimelineChart> = {
  title: 'Charts/Timeline Chart',
  component: TimelineChart,
};

export default meta;
type Story = StoryObj<typeof TimelineChart>;

const baseTime = new Date('2026-04-01T09:00:00Z').getTime();
const minute = 60_000;
const rangeOptions = [
  { label: '5M', start: baseTime, stop: baseTime + 5 * minute },
  { label: '15M', start: baseTime, stop: baseTime + 15 * minute },
  { label: 'All', start: baseTime, stop: baseTime + 18 * minute },
];

export const AgentRunTimeline: Story = {
  render: () => (
    <SyntaxExample>
      <TimelineChart
        height={260}
        defaultRangeLabel="All"
        items={[
          {
            id: 'recon',
            label: 'Plan run',
            category: 'Plan',
            startTime: baseTime,
            endTime: baseTime + 4 * minute,
            status: 'success',
            metrics: [
              { label: 'signals', value: 12 },
              { label: 'hosts', value: 48 },
            ],
          },
          {
            id: 'auth-check',
            label: 'Tool setup',
            category: 'Tools',
            startTime: baseTime + 3 * minute,
            endTime: baseTime + 9 * minute,
            status: 'success',
          },
          {
            id: 'serialize',
            label: 'Serialize turns',
            category: 'Thread',
            startTime: baseTime + 5 * minute,
            endTime: baseTime + 14 * minute,
            status: 'failed',
          },
          {
            id: 'report',
            label: 'Generate report',
            category: 'Report',
            startTime: baseTime + 14 * minute,
            status: 'in-progress',
          },
        ]}
        gridIntervalMs={minute}
        nowTimestamp={baseTime + 18 * minute}
        rangeOptions={rangeOptions}
      />
    </SyntaxExample>
  ),
};
