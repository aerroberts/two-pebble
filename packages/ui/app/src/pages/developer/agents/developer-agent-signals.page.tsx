import { Button, Header, PageLayout, Section, Table, type TableColumn } from '@two-pebble/components';
import type { AgentSignalWireRecord } from '@two-pebble/protocol';
import { type AgentRecord, useAgents, useRealtimeDatastore } from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LoadStatus = 'loading' | 'ready' | 'error';

interface AgentSignalRow {
  id: string;
  agentId: string;
  agentName: string;
  capabilityId: string;
  description: string;
  kind: AgentSignalWireRecord['kind'];
  name: string;
  status: AgentSignalWireRecord['status'];
  updatedAt: number;
}

const signalColumns: TableColumn<AgentSignalRow>[] = [
  { id: 'agent', header: 'Agent', cell: (row) => row.agentName },
  { id: 'signal', header: 'Signal', cell: (row) => row.name },
  { id: 'kind', header: 'Kind', cell: (row) => row.kind },
  { id: 'status', header: 'Status', cell: (row) => row.status },
  { id: 'capability', header: 'Capability', cell: (row) => row.capabilityId },
  { id: 'updated', header: 'Updated', cell: (row) => new Date(row.updatedAt).toLocaleString() },
  { id: 'description', header: 'Description', cell: (row) => row.description },
];

export function DeveloperAgentSignalsPage() {
  const agents = useAgents();
  const datastore = useRealtimeDatastore();
  const navigate = useNavigate();
  const [signals, setSignals] = useState<AgentSignalWireRecord[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const refresh = useCallback(async () => {
    const agentRows = agents.values();
    setStatus('loading');
    try {
      const results = await Promise.all(
        agentRows.map((agent) => datastore.emit('listAgentSignals', { agentId: agent.id })),
      );
      setSignals(results.flatMap((result) => result.items));
      setStatus('ready');
    } catch {
      setSignals([]);
      setStatus('error');
    }
  }, [agents, datastore]);

  useEffect(() => {
    if (agents.status === 'loading' || agents.status === 'idle') {
      return;
    }
    void refresh();
  }, [agents.status, refresh]);

  const rows = useMemo(() => buildSignalRows(signals, agents.values()), [agents, signals]);
  const emptyMessage =
    status === 'loading'
      ? 'Loading agent signals.'
      : status === 'error'
        ? 'Could not load agent signals.'
        : 'No unresolved agent signals.';

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button leftIcon="refresh-cw" onClick={() => void refresh()} type="button">
            Refresh
          </Button>
        }
        subtitle="Unresolved signal records grouped across known daemon agents."
      >
        Signals
      </Header>
      <Section>
        <Table
          columns={signalColumns}
          rows={rows}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/agents/${row.agentId}`)}
          emptyMessage={emptyMessage}
        />
      </Section>
    </PageLayout>
  );
}

function buildSignalRows(signals: AgentSignalWireRecord[], agents: AgentRecord[]): AgentSignalRow[] {
  const agentLookup = new Map(agents.map((agent) => [agent.id, agent]));
  return signals
    .filter((signal) => signal.status !== 'resolved')
    .map((signal) => {
      const agent = agentLookup.get(signal.agentId);
      return {
        id: signal.id,
        agentId: signal.agentId,
        agentName: agent?.name ?? signal.agentId,
        capabilityId: signal.capabilityId,
        description: signal.description,
        kind: signal.kind,
        name: signal.name,
        status: signal.status,
        updatedAt: signal.updatedAt,
      };
    });
}
