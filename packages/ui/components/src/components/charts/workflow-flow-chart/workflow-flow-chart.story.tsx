import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { CHART_COLORS } from '../utils/chart-colors';
import { WorkflowFlowChart } from './workflow-flow-chart';

const meta: Meta<typeof WorkflowFlowChart> = {
  title: 'Charts/Workflow Flow Chart',
  component: WorkflowFlowChart,
};

export default meta;
type Story = StoryObj<typeof WorkflowFlowChart>;

export const AgentRuntimePipeline: Story = {
  render: () => (
    <SyntaxExample>
      <WorkflowFlowChart
        nodes={[
          {
            id: 'intake',
            title: 'Intake',
            subtitle: 'New scope received',
            icon: 'inbox',
            iconColor: CHART_COLORS.blue,
            tooltip: { Owner: 'Runtime', SLA: '2h' },
          },
          {
            id: 'recon',
            title: 'Recon',
            subtitle: 'Surface discovery',
            icon: 'search',
            iconColor: CHART_COLORS.green,
          },
          {
            id: 'execute',
            title: 'Execute',
            subtitle: 'Run tools',
            icon: 'zap',
            iconColor: CHART_COLORS.orange,
            children: [
              { id: 'plan', title: 'Plan', icon: 'list-checks' },
              { id: 'edit', title: 'Edit', icon: 'pencil' },
            ],
          },
          {
            id: 'report',
            title: 'Report',
            rightValue: '12 signals',
            icon: 'file-text',
            iconColor: CHART_COLORS.cyan,
          },
        ]}
      />
    </SyntaxExample>
  ),
};
