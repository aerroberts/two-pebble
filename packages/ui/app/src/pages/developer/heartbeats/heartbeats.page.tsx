import { Header, PageLayout, Section, Surface, Table, type TableColumn } from '@two-pebble/components';
import { type HeartbeatRecord, useHeartbeats } from '@two-pebble/realtime';

const columns: TableColumn<HeartbeatRecord>[] = [
  { id: 'tickAt', header: 'Tick', cell: (row) => new Date(row.tickAt).toLocaleString() },
  { id: 'durationMs', header: 'Duration', align: 'right', cell: (row) => `${row.durationMs}ms` },
  { id: 'listenerCount', header: 'Listeners', align: 'right', cell: (row) => row.listenerCount },
  {
    id: 'reports',
    header: 'Reports',
    cell: (row) => (
      <details className="max-w-[42rem]">
        <summary className="cursor-pointer text-content">{row.reports.length} reports</summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-surface-hover p-3 text-[11px] leading-4 text-content-muted">
          {JSON.stringify(row.reports, null, 2)}
        </pre>
      </details>
    ),
  },
];

export function HeartbeatsPage() {
  const heartbeats = useHeartbeats();
  const rows = heartbeats.values().sort((left, right) => right.tickAt - left.tickAt);

  return (
    <PageLayout width="full">
      <Header subtitle="Recent daemon heartbeat audit rows and per-listener outcomes.">Heartbeats</Header>
      <Section>
        {heartbeats.status === 'loading' ? <Surface>Loading heartbeats.</Surface> : null}
        {heartbeats.status === 'error' ? <Surface>Could not load heartbeats.</Surface> : null}
        {heartbeats.status !== 'loading' && heartbeats.status !== 'error' ? (
          <Table columns={columns} emptyMessage="No heartbeat rows recorded." getRowKey={(row) => row.id} rows={rows} />
        ) : null}
      </Section>
    </PageLayout>
  );
}
