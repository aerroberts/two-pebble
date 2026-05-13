import { Button, Header, PageLayout, Section, Table, type TableColumn } from '@two-pebble/components';
import { type AgentRecord, useAgents, useRealtimeDatastore } from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LoadStatus = 'loading' | 'ready' | 'error';
type StartedAt = number | null;

interface HotAgentRow {
  id: string;
  name: string;
  status: string;
  startedAt: StartedAt;
}

const hotAgentColumns: TableColumn<HotAgentRow>[] = [
  { id: 'name', header: 'Agent', cell: (row) => row.name },
  { id: 'status', header: 'Status', cell: (row) => row.status },
  { id: 'startedAt', header: 'Started', cell: (row) => formatStartedAt(row.startedAt) },
  { id: 'id', header: 'ID', cell: (row) => row.id },
];

export function DeveloperAgentsPage() {
  const agents = useAgents();
  const datastore = useRealtimeDatastore();
  const navigate = useNavigate();
  const [activeAgentIds, setActiveAgentIds] = useState<string[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await datastore.emit('getDaemonStatus', {});
      setActiveAgentIds(result.activeAgentIds);
      setStatus('ready');
    } catch {
      setActiveAgentIds([]);
      setStatus('error');
    }
  }, [datastore]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(() => buildHotAgentRows(activeAgentIds, agents.values()), [activeAgentIds, agents]);
  const emptyMessage =
    status === 'loading'
      ? 'Loading active daemon agents.'
      : status === 'error'
        ? 'Could not load active daemon agents.'
        : 'No agents are active in this daemon process.';

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button leftIcon="refresh-cw" onClick={() => void refresh()} type="button">
            Refresh
          </Button>
        }
        subtitle="Runtime agents currently held hot in this daemon process."
      >
        Agents
      </Header>
      <Section>
        <Table
          columns={hotAgentColumns}
          rows={rows}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/agents/${row.id}`)}
          emptyMessage={emptyMessage}
        />
      </Section>
    </PageLayout>
  );
}

function buildHotAgentRows(activeAgentIds: string[], agents: AgentRecord[]): HotAgentRow[] {
  const agentLookup = new Map(agents.map((agent) => [agent.id, agent]));
  return activeAgentIds.map((id) => {
    const agent = agentLookup.get(id);
    return {
      id,
      name: agent?.name ?? id,
      status: agent?.status ?? 'active',
      startedAt: agent?.startedAt ?? null,
    };
  });
}

function formatStartedAt(startedAt: StartedAt): string {
  if (startedAt === null) {
    return 'Unknown';
  }
  return new Date(startedAt).toLocaleString();
}
