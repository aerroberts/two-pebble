import {
  AutomationIndicator,
  type AutomationIndicatorState,
  Button,
  Header,
  PageLayout,
  Section,
  Surface,
  Table,
  type TableColumn,
} from '@two-pebble/components';
import { type AutomationRecord, useAutomations } from '@two-pebble/realtime';
import { useNavigate } from 'react-router-dom';
import { formatCadenceLabel, formatTimestamp, nextDueAt } from './automation-format';

interface AutomationIndicatorCellProps {
  automation: AutomationRecord;
}

function AutomationIndicatorCell(props: AutomationIndicatorCellProps) {
  const automation = props.automation;
  const state: AutomationIndicatorState = !automation.enabled
    ? 'disabled'
    : automation.intervalUnit === 'manual'
      ? 'manual'
      : 'scheduled';

  return (
    <AutomationIndicator
      state={state}
      variant="pill"
      cadenceLabel={formatCadenceLabel(automation)}
      cadenceTitle={`Every ${automation.intervalValue} ${automation.intervalUnit}`}
    />
  );
}

const columns: TableColumn<AutomationRecord>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row) => row.name,
  },
  { id: 'lastRanAt', header: 'Last run', cell: (row) => formatTimestamp(row.lastRanAt) },
  { id: 'nextDueAt', header: 'Next due', cell: (row) => formatTimestamp(nextDueAt(row)) },
  {
    id: 'indicator',
    header: '',
    align: 'right',
    width: '60px',
    cell: (row) => <AutomationIndicatorCell automation={row} />,
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
