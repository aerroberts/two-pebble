import { Header, PageLayout, PrStatusIcon, Section, Surface, Table, type TableColumn } from '@two-pebble/components';
import { type TrackedPrRecord, useAgents, useMyOpenPrs } from '@two-pebble/realtime';

const columns = (agentName: (agentId: string) => string): TableColumn<TrackedPrRecord>[] => [
  {
    id: 'state',
    header: '',
    cell: (row) => (
      <PrStatusIcon
        state={row.state}
        checksInFlight={row.checks.some((check) => check.status === 'queued' || check.status === 'in_progress')}
      />
    ),
  },
  { id: 'repo', header: 'Repository', cell: (row) => row.repo },
  { id: 'number', header: 'PR', cell: (row) => <a href={row.url}>#{row.number}</a> },
  { id: 'taskId', header: 'Task', cell: (row) => row.taskId },
  { id: 'agentId', header: 'Agent', cell: (row) => agentName(row.agentId) },
];

export function OverviewPage() {
  const agents = useAgents();
  const { prs } = useMyOpenPrs();
  const agentName = (agentId: string) => agents.values().find((agent) => agent.id === agentId)?.name ?? agentId;

  return (
    <PageLayout width="fixed">
      <Header>Overview</Header>
      <Section title="My Open PRs">
        {prs.length === 0 ? (
          <Surface>No open pull requests.</Surface>
        ) : (
          <Table columns={columns(agentName)} getRowKey={(row) => row.id} rows={prs} />
        )}
      </Section>
    </PageLayout>
  );
}
