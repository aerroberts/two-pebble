import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { DataGrid } from './data-grid';

const meta: Meta<typeof DataGrid> = {
  title: 'Data/Data Grid',
  component: DataGrid,
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

export const ReadOnly: Story = {
  render: () => (
    <SyntaxExample>
      <DataGrid
        columns={3}
        data={{
          Application: 'ACME Corp Portal',
          Environment: 'Production',
          Status: 'Active',
          'Last Run': 'Jan 15, 2025',
          Signals: '24',
          Health: 'Good',
        }}
      />
    </SyntaxExample>
  ),
};

export const Editable: Story = {
  render: () => {
    const [data, setData] = useState<Record<string, string>>({
      Owner: 'runtime-platform',
      Notes: 'Waiting on runtime settings update',
      'Review window': '2026-03-17 09:00 UTC',
      Status: 'Active',
    });

    return (
      <SyntaxExample>
        <DataGrid
          columns={2}
          data={data}
          editable={['Owner', 'Notes']}
          onEdit={(nextData) => setData(nextData as Record<string, string>)}
        />
      </SyntaxExample>
    );
  },
};
