import React from 'react';
import { Status, type StatusState } from '../../content/status/status';
import type { TableColumn } from '../../data/table/types';

interface AgentRow {
  name: string;
  status: StatusState;
  container: string;
  uptime: string;
}

export const agentColumns: TableColumn<AgentRow>[] = [
  { id: 'name', header: 'Name', cell: (row) => React.createElement('span', { className: 'font-medium' }, row.name) },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => React.createElement(Status, { state: row.status, variant: 'icon', label: row.status }),
  },
  { id: 'container', header: 'Container', cell: (row) => row.container },
  { id: 'uptime', header: 'Uptime', cell: (row) => row.uptime, align: 'right' },
];

export const agentRows: AgentRow[] = [
  { name: 'worker-01', status: 'connected', container: 'fargate-a1b2', uptime: '2h 14m' },
  { name: 'worker-02', status: 'connected', container: 'fargate-c3d4', uptime: '1h 47m' },
  { name: 'runner-01', status: 'in-progress', container: 'fargate-e5f6', uptime: '45m' },
  { name: 'model-router', status: 'disconnected', container: 'fargate-g7h8', uptime: '—' },
];
