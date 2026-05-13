import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Table } from './table';

const meta: Meta<typeof Table> = {
  title: 'Data/Table',
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

interface Route {
  path: string;
  method: string;
  auth: string;
  status: string;
  latency: string;
}

const columns = [
  { id: 'path', header: 'Path', cell: (row: Route) => row.path },
  { id: 'method', header: 'Method', cell: (row: Route) => row.method },
  { id: 'auth', header: 'Auth', cell: (row: Route) => row.auth },
  { id: 'status', header: 'Status', cell: (row: Route) => row.status },
  { id: 'latency', header: 'Latency', cell: (row: Route) => row.latency, align: 'right' as const },
];

const rows: Route[] = [
  { path: '/api/users', method: 'GET', auth: 'Token', status: 'Healthy', latency: '42 ms' },
  { path: '/api/login', method: 'POST', auth: 'None', status: 'Healthy', latency: '118 ms' },
  { path: '/api/projects', method: 'GET', auth: 'Token', status: 'Healthy', latency: '64 ms' },
  { path: '/api/projects/:id', method: 'PATCH', auth: 'Token', status: 'Degraded', latency: '286 ms' },
  { path: '/api/events', method: 'POST', auth: 'Signature', status: 'Healthy', latency: '91 ms' },
  { path: '/api/search', method: 'GET', auth: 'Token', status: 'Healthy', latency: '153 ms' },
  { path: '/api/reports/export', method: 'POST', auth: 'Admin', status: 'Queued', latency: '1.2 s' },
  { path: '/api/webhooks/github', method: 'POST', auth: 'Signature', status: 'Healthy', latency: '76 ms' },
];

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Table columns={columns} rows={rows} getRowKey={(row) => row.path} />
    </SyntaxExample>
  ),
};
