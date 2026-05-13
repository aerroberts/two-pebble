import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Heatmap } from './heatmap';

const meta: Meta<typeof Heatmap> = {
  title: 'Charts/Heatmap',
  component: Heatmap,
};

export default meta;
type Story = StoryObj<typeof Heatmap>;

const horizontalLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const verticalLabels = [
  { id: 'model', label: 'Model' },
  { id: 'tool', label: 'Tool' },
  { id: 'trace', label: 'Trace' },
  { id: 'ui', label: 'UI' },
  { id: 'runtime', label: 'Runtime' },
];

const sampleData = verticalLabels.flatMap((row, rowIndex) =>
  horizontalLabels.map((column, columnIndex) => ({
    x: column,
    y: row.id,
    value: ((rowIndex + 2) * (columnIndex + 3)) % 19,
    label: `${row.label} activity on ${column}`,
  })),
);

export const Matrix: Story = {
  render: () => (
    <SyntaxExample>
      <Heatmap data={sampleData} horizontalLabels={horizontalLabels} verticalLabels={verticalLabels} />
    </SyntaxExample>
  ),
};

export const CellSizes: Story = {
  render: () => (
    <SyntaxExample>
      <div className="space-y-6">
        <Heatmap
          cellSizePx={12}
          data={sampleData}
          horizontalLabels={horizontalLabels}
          verticalLabels={verticalLabels}
        />
        <Heatmap
          cellSizePx={28}
          data={sampleData}
          horizontalLabels={horizontalLabels}
          verticalLabels={verticalLabels}
        />
      </div>
    </SyntaxExample>
  ),
};

export const CustomTooltipAndClick: Story = {
  render: () => (
    <SyntaxExample>
      <Heatmap
        cellColor="#4dabf7"
        data={sampleData}
        horizontalLabels={horizontalLabels}
        onCellClick={(cell) => {
          console.log(`Clicked ${cell.y}/${cell.x}: ${cell.value}`);
        }}
        renderTooltip={(cell, context) => (
          <div className="px-1 py-0.5">
            <div className="font-medium text-content">{cell.label}</div>
            <div className="text-content-muted">
              {context.yLabel.label} / {context.xLabel.label}: {cell.value} events
            </div>
          </div>
        )}
        verticalLabels={verticalLabels}
      />
    </SyntaxExample>
  ),
};

export const Empty: Story = {
  render: () => (
    <SyntaxExample>
      <Heatmap
        data={[]}
        emptyMessage="No matrix data"
        horizontalLabels={horizontalLabels}
        verticalLabels={verticalLabels}
      />
    </SyntaxExample>
  ),
};
