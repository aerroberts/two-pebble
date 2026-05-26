import {
  DataPanelLayout,
  Header,
  ListLayout,
  PageLayout,
  Section,
  Surface,
  Table,
  type TableColumn,
} from '@two-pebble/components';
import { type HeartbeatRecord, useHeartbeats } from '@two-pebble/realtime';
import { useState } from 'react';

const columns: TableColumn<HeartbeatRecord>[] = [
  { id: 'tickAt', header: 'Tick', cell: (row) => new Date(row.tickAt).toLocaleString() },
  { id: 'durationMs', header: 'Duration', align: 'right', cell: (row) => `${row.durationMs}ms` },
  { id: 'listenerCount', header: 'Listeners', align: 'right', cell: (row) => row.listenerCount },
];

export function HeartbeatsPage() {
  const heartbeats = useHeartbeats();
  const rows = heartbeats.values().sort((left, right) => right.tickAt - left.tickAt);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId === null ? null : rows.find((row) => row.id === selectedId);

  const panel = selected ? (
    <div className="flex flex-col gap-3">
      <div className="text-[13px] font-medium text-content">{new Date(selected.tickAt).toLocaleString()}</div>
      <ListLayout
        emptyState="No listeners reported on this tick."
        items={selected.reports.map((report) => ({
          key: report.listenerId,
          title: report.listenerId,
          subtitle: report.kind,
          value: report.outcome,
          trailingAccessory:
            Object.keys(report.detail).length > 0 ? (
              <pre className="max-w-[18rem] overflow-x-auto rounded-md bg-surface-hover p-2 text-[10px] leading-4 text-content-muted">
                {JSON.stringify(report.detail, null, 2)}
              </pre>
            ) : null,
        }))}
      />
    </div>
  ) : null;

  return (
    <DataPanelLayout open={selected !== null} panel={panel} closeable onClose={() => setSelectedId(null)}>
      <PageLayout width="full">
        <Header subtitle="Recent daemon heartbeat audit rows and per-listener outcomes.">Heartbeats</Header>
        <Section>
          {heartbeats.status === 'loading' ? <Surface>Loading heartbeats.</Surface> : null}
          {heartbeats.status === 'error' ? <Surface>Could not load heartbeats.</Surface> : null}
          {heartbeats.status !== 'loading' && heartbeats.status !== 'error' ? (
            <Table
              columns={columns}
              emptyMessage="No heartbeat rows recorded."
              getRowKey={(row) => row.id}
              rows={rows}
              onRowClick={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
            />
          ) : null}
        </Section>
      </PageLayout>
    </DataPanelLayout>
  );
}
