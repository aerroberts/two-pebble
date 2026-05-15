import { Button, Header, PageLayout, Section, Surface, Table, type TableColumn } from '@two-pebble/components';
import { type AutomationRecord, useAutomations } from '@two-pebble/realtime';
import { CircleSlash, MousePointerClick } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCadenceLabel, formatTimestamp, nextDueAt } from './automation-format';

function AutomationIndicator({ automation }: { automation: AutomationRecord }) {
  if (!automation.enabled) {
    return (
      <span className="inline-flex items-center gap-1 text-content-muted opacity-50" title="Disabled">
        <CircleSlash size={14} />
      </span>
    );
  }
  if (automation.intervalUnit === 'manual') {
    return (
      <span className="inline-flex items-center gap-1 text-content-muted" title="Manual">
        <MousePointerClick size={14} />
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded bg-content/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-content-muted"
      title={`Every ${automation.intervalValue} ${automation.intervalUnit}`}
    >
      {formatCadenceLabel(automation)}
    </span>
  );
}

const columns: TableColumn<AutomationRecord>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row) => <span className={row.enabled ? undefined : 'opacity-50'}>{row.name}</span>,
  },
  { id: 'lastRanAt', header: 'Last run', cell: (row) => formatTimestamp(row.lastRanAt) },
  { id: 'nextDueAt', header: 'Next due', cell: (row) => formatTimestamp(nextDueAt(row)) },
  {
    id: 'indicator',
    header: '',
    align: 'right',
    width: '60px',
    cell: (row) => <AutomationIndicator automation={row} />,
  },
];

export function AutomationsPage() {
  const automations = useAutomations();
  const navigate = useNavigate();
  const rows = automations.values().sort((left, right) => left.name.localeCompare(right.name));

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button leftIcon="plus" onClick={() => navigate('/automations/new')}>
            New automation
          </Button>
        }
        subtitle="Scheduled and manual agent launches driven by the daemon heartbeat."
      >
        Automations
      </Header>
      <Section>
        {automations.status === 'loading' ? <Surface>Loading automations.</Surface> : null}
        {automations.status === 'error' ? <Surface>Could not load automations.</Surface> : null}
        {automations.status !== 'loading' && automations.status !== 'error' ? (
          <Table
            columns={columns}
            emptyMessage="No automations configured."
            getRowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/automations/${row.id}`)}
            rows={rows}
          />
        ) : null}
      </Section>
    </PageLayout>
  );
}
