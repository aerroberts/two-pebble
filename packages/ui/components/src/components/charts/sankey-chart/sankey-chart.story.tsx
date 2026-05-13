import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { CHART_COLORS, chartColorToRgba } from '../utils/chart-colors';
import { SankeyChart } from './sankey-chart';

const meta: Meta<typeof SankeyChart> = {
  title: 'Charts/Sankey Chart',
  component: SankeyChart,
};

export default meta;
type Story = StoryObj<typeof SankeyChart>;

export const RuntimeFlow: Story = {
  render: () => (
    <SyntaxExample>
      <SankeyChart
        stages={[
          {
            header: 'Triage',
            links: [
              { from: 'Identified', to: 'Confirmed', count: 58 },
              { from: 'Identified', to: 'Dismissed', count: 12 },
            ],
          },
          {
            header: 'Resolution',
            links: [
              { from: 'Confirmed', to: 'Resolved', count: 40 },
              { from: 'Confirmed', to: 'Accepted', count: 14 },
              { from: 'Confirmed', to: 'Pending', count: 4 },
            ],
          },
        ]}
        nodeColors={{
          Identified: CHART_COLORS.blue,
          Confirmed: CHART_COLORS.indigo,
          Dismissed: CHART_COLORS.slate,
          Resolved: CHART_COLORS.green,
          Accepted: CHART_COLORS.amber,
          Pending: CHART_COLORS.orange,
        }}
        linkColors={{
          Identified: chartColorToRgba(CHART_COLORS.blue, 0.2),
          Confirmed: chartColorToRgba(CHART_COLORS.indigo, 0.2),
        }}
      />
    </SyntaxExample>
  ),
};
