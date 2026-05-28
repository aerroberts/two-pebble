import {
  DataPanelLayout,
  Header,
  ListLayout,
  PageLayout,
  Section,
  Surface,
  Table,
  type TableColumn,
  TabSelect,
} from '@two-pebble/components';
import { type HeartbeatRecord, useHeartbeats } from '@two-pebble/realtime';
import { useMemo, useState } from 'react';

type View = 'logs' | 'events';

interface HeartbeatEventRow {
  id: string;
  tickAt: number;
  listenerId: string;
  kind: string;
  outcome: 'fired' | 'skipped' | 'error';
  detail: Record<string, unknown>;
}

const logColumns: TableColumn<HeartbeatRecord>[] = [
  { id: 'tickAt', header: 'Tick', cell: (row) => new Date(row.tickAt).toLocaleString() },
  { id: 'durationMs', header: 'Duration', align: 'right', cell: (row) => `${row.durationMs}ms` },
  { id: 'listenerCount', header: 'Listeners', align: 'right', cell: (row) => row.listenerCount },
];

const eventColumns: TableColumn<HeartbeatEventRow>[] = [
  { id: 'tickAt', header: 'Tick', cell: (row) => new Date(row.tickAt).toLocaleString() },
  { id: 'listenerId', header: 'Listener', cell: (row) => row.listenerId },
  { id: 'kind', header: 'Kind', cell: (row) => row.kind },
  { id: 'outcome', header: 'Outcome', cell: (row) => row.outcome },
];

const VIEW_OPTIONS = [
  { value: 'logs', label: 'Logs' },
  { value: 'events', label: 'Events' },
];

export function HeartbeatsPage() {
  const heartbeats = useHeartbeats();
  const [view, setView] = useState<View>('logs');
  const rows = useMemo(() => heartbeats.values().sort((left, right) => right.tickAt - left.tickAt), [heartbeats]);
  const events = useMemo<HeartbeatEventRow[]>(() => {
    const collected: HeartbeatEventRow[] = [];
    for (const heartbeat of rows) {
      for (const report of heartbeat.reports) {
        collected.push({
          id: `${heartbeat.id}:${report.listenerId}`,
          tickAt: heartbeat.tickAt,
          listenerId: report.listenerId,
          kind: report.kind,
          outcome: report.outcome,
          detail: report.detail,
        });
      }
    }
    return collected;
  }, [rows]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selected = selectedId === null ? null : rows.find((row) => row.id === selectedId);
  const selectedEvent = selectedEventId === null ? null : events.find((row) => row.id === selectedEventId);

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedEventId(null);
  };

  const logPanel = selected ? (
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
              report.kind === 'github' ? (
                <GithubHeartbeatDetail detail={report.detail} />
              ) : (
                <pre className="max-w-[18rem] overflow-x-auto rounded-md bg-surface-hover p-2 text-[10px] leading-4 text-content-muted">
                  {JSON.stringify(report.detail, null, 2)}
                </pre>
              )
            ) : null,
        }))}
      />
    </div>
  ) : null;

  const eventPanel = selectedEvent ? (
    <div className="flex flex-col gap-3">
      <div className="text-[13px] font-medium text-content">{new Date(selectedEvent.tickAt).toLocaleString()}</div>
      <div className="text-xs text-content-muted">
        {selectedEvent.listenerId} · {selectedEvent.kind} · {selectedEvent.outcome}
      </div>
      <pre className="max-w-full overflow-x-auto rounded-md bg-surface-hover p-2 text-[11px] leading-4 text-content-muted">
        {JSON.stringify(selectedEvent.detail, null, 2)}
      </pre>
    </div>
  ) : null;

  const panelOpen = view === 'logs' ? selected !== null : selectedEvent !== null;
  const panel = view === 'logs' ? logPanel : eventPanel;

  return (
    <DataPanelLayout open={panelOpen} panel={panel} closeable onClose={closeDetail}>
      <PageLayout>
        <Header subtitle="Recent daemon heartbeat audit rows and per-listener outcomes.">Heartbeats</Header>
        <Section>
          <div className="pb-3">
            <TabSelect
              options={VIEW_OPTIONS}
              value={view}
              onChange={(next) => {
                setView(next as View);
                closeDetail();
              }}
            />
          </div>
          {heartbeats.status === 'loading' ? <Surface>Loading heartbeats.</Surface> : null}
          {heartbeats.status === 'error' ? <Surface>Could not load heartbeats.</Surface> : null}
          {heartbeats.status !== 'loading' && heartbeats.status !== 'error' ? (
            view === 'logs' ? (
              <Table
                columns={logColumns}
                emptyMessage="No heartbeat rows recorded."
                getRowKey={(row) => row.id}
                rows={rows}
                onRowClick={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
              />
            ) : (
              <Table
                columns={eventColumns}
                emptyMessage="No heartbeat events recorded."
                getRowKey={(row) => row.id}
                rows={events}
                onRowClick={(row) => setSelectedEventId(row.id === selectedEventId ? null : row.id)}
              />
            )
          ) : null}
        </Section>
      </PageLayout>
    </DataPanelLayout>
  );
}

function GithubHeartbeatDetail(props: { detail: Record<string, unknown> }) {
  const updates = Array.isArray(props.detail.prUpdates) ? props.detail.prUpdates : [];
  const errors = Array.isArray(props.detail.errors) ? props.detail.errors : [];
  return (
    <div className="flex max-w-[22rem] flex-col gap-1 rounded-md bg-surface-hover p-2 text-[10px] leading-4 text-content-muted">
      <div>
        Polled {String(props.detail.polled ?? 0)}, transitioned {String(props.detail.transitioned ?? 0)}
      </div>
      {updates.map((item) => (
        <div key={`u:${formatGithubUpdate(item)}`} className="text-content">
          {formatGithubUpdate(item)}
        </div>
      ))}
      {errors.map((item) => (
        <div key={`e:${formatGithubError(item)}`} className="text-danger">
          {formatGithubError(item)}
        </div>
      ))}
    </div>
  );
}

function formatGithubUpdate(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return 'PR updated';
  }
  const record = value as Record<string, unknown>;
  return `${String(record.prId ?? 'PR')}: ${String(record.from ?? '?')} -> ${String(record.to ?? '?')}`;
}

function formatGithubError(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return 'GitHub polling error';
  }
  const record = value as Record<string, unknown>;
  return `${String(record.prId ?? 'PR')}: ${String(record.status ?? 0)} ${String(record.message ?? '')}`;
}
