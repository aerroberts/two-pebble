import {
  Button,
  ButtonGroup,
  Checkbox,
  Header,
  IconButton,
  Input,
  InputArea,
  PageLayout,
  Section,
  Select,
  Surface,
  Table,
  type TableColumn,
} from '@two-pebble/components';
import {
  type AutomationIntervalUnit,
  type AutomationRecord,
  type HeartbeatReport,
  useAutomations,
  useDeleteAutomation,
  useHeartbeats,
  useProjectAgentRegistries,
  useRunAutomationNow,
  useUpdateAutomation,
} from '@two-pebble/realtime';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { projectPath, useProjectId } from '../../../project-context';
import { formatAutomationInterval, formatTimestamp, nextDueAt } from '../automation-format';

interface ScheduleOption {
  value: string;
  label: string;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
}

const scheduleOptions: ScheduleOption[] = [
  { value: 'manual', label: 'Manual', intervalUnit: 'manual', intervalValue: 1 },
  { value: '1:hours', label: 'Every 1 hour', intervalUnit: 'hours', intervalValue: 1 },
  { value: '4:hours', label: 'Every 4 hours', intervalUnit: 'hours', intervalValue: 4 },
  { value: '1:days', label: 'Every 1 day', intervalUnit: 'days', intervalValue: 1 },
];

function toScheduleValue(intervalUnit: AutomationIntervalUnit, intervalValue: number): string {
  if (intervalUnit === 'manual') {
    return 'manual';
  }
  const match = scheduleOptions.find((o) => o.intervalUnit === intervalUnit && o.intervalValue === intervalValue);
  return match?.value ?? 'manual';
}

const reportColumns: TableColumn<HeartbeatReport & { tickAt: number }>[] = [
  { id: 'tickAt', header: 'Tick', cell: (row) => formatTimestamp(row.tickAt) },
  { id: 'outcome', header: 'Outcome', cell: (row) => row.outcome },
  { id: 'detail', header: 'Detail', cell: (row) => JSON.stringify(row.detail) },
];

export function AutomationDetailPage() {
  const { automationId } = useParams();
  const projectId = useProjectId();
  const navigate = useNavigate();
  const automations = useAutomations({ projectId });
  const heartbeats = useHeartbeats();
  const agentRegistries = useProjectAgentRegistries(projectId);
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();
  const runNow = useRunAutomationNow();
  const automation = automationId === undefined ? null : (automations.getItem(automationId)?.value ?? null);
  const [draft, setDraft] = useState<AutomationDraft | null>(null);
  const [running, setRunning] = useState(false);

  // Initialize (or reset) the draft only when switching automations, not on
  // every record update — otherwise an auto-save round-trip would clobber
  // in-flight edits.
  const syncedAutomationId = useRef<string | null>(null);
  useEffect(() => {
    if (automation === null) {
      syncedAutomationId.current = null;
      setDraft(null);
      return;
    }
    if (syncedAutomationId.current !== automation.id) {
      syncedAutomationId.current = automation.id;
      setDraft(toDraft(automation));
    }
  }, [automation]);

  // Auto-save: persist the draft shortly after edits settle. The diff guard
  // keeps the save from re-firing once the updated record echoes back.
  useEffect(() => {
    if (automation === null || draft === null) {
      return;
    }
    if (draft.name.trim().length === 0 || !draftDiffersFrom(draft, automation)) {
      return;
    }
    const timer = setTimeout(() => {
      void updateAutomation({
        agentRegistryId: draft.agentRegistryId,
        enabled: draft.enabled,
        id: automation.id,
        intervalUnit: draft.intervalUnit,
        intervalValue: draft.intervalValue,
        message: draft.message,
        name: draft.name.trim(),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [draft, automation, updateAutomation]);

  if (automationId === undefined) {
    return <Navigate replace to={projectPath(projectId, '/automations')} />;
  }

  if (automations.status === 'ready' && automation === null) {
    return <Navigate replace to={projectPath(projectId, '/automations')} />;
  }

  if (automation === null || draft === null) {
    return (
      <PageLayout width="fixed">
        <Header>Automation</Header>
        <Section>
          <Surface>Loading automation.</Surface>
        </Section>
      </PageLayout>
    );
  }

  const registryOptions = agentRegistries.values().map((registry) => ({ label: registry.name, value: registry.id }));
  const reports = heartbeats
    .values()
    .flatMap((heartbeat) =>
      heartbeat.reports
        .filter((report) => report.listenerId === `automation:${automation.id}`)
        .map((report) => ({ ...report, tickAt: heartbeat.tickAt })),
    )
    .sort((left, right) => right.tickAt - left.tickAt)
    .slice(0, 20);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await runNow({ id: automation.id });
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async () => {
    await deleteAutomation({ id: automation.id });
    navigate(projectPath(projectId, '/automations'));
  };

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <>
            <Button disabled={running} leftIcon="play" onClick={() => void handleRunNow()}>
              {running ? 'Running' : 'Run now'}
            </Button>
            <IconButton
              aria-label="Delete automation"
              icon="trash-2"
              onClick={() => void handleDelete()}
              type="button"
            />
          </>
        }
        subtitle={`${formatAutomationInterval(automation)} · Last run ${formatTimestamp(automation.lastRanAt)} · Next due ${formatTimestamp(nextDueAt(automation))}`}
      >
        {automation.name}
      </Header>
      <Section title="Configure">
        <Surface>
          <Input
            label="Name"
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            value={draft.name}
          />
          <Select
            fullWidth
            label="Agent"
            onChange={(agentRegistryId) => setDraft({ ...draft, agentRegistryId })}
            options={registryOptions}
            value={draft.agentRegistryId}
          />
          <InputArea
            label="Message"
            onChange={(event) => setDraft({ ...draft, message: event.target.value })}
            value={draft.message}
          />
          <ButtonGroup
            label="Schedule"
            onChange={(value) => {
              const option = scheduleOptions.find((o) => o.value === value);
              if (option) {
                setDraft({ ...draft, intervalUnit: option.intervalUnit, intervalValue: option.intervalValue });
              }
            }}
            options={scheduleOptions}
            value={toScheduleValue(draft.intervalUnit, draft.intervalValue)}
          />
          <Checkbox
            checked={draft.enabled}
            label="Enabled"
            onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
          />
        </Surface>
      </Section>
      <Section title="Last firings">
        <Table
          columns={reportColumns}
          emptyMessage="No heartbeat reports for this automation."
          getRowKey={(row, index) => `${row.tickAt}:${index}`}
          rows={reports}
        />
      </Section>
    </PageLayout>
  );
}

interface AutomationDraft {
  agentRegistryId: string;
  enabled: boolean;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
  message: string;
  name: string;
}

function toDraft(automation: AutomationRecord): AutomationDraft {
  return {
    agentRegistryId: automation.agentRegistryId,
    enabled: automation.enabled,
    intervalUnit: automation.intervalUnit,
    intervalValue: automation.intervalValue,
    message: automation.message,
    name: automation.name,
  };
}

function draftDiffersFrom(draft: AutomationDraft, automation: AutomationRecord): boolean {
  return (
    draft.agentRegistryId !== automation.agentRegistryId ||
    draft.enabled !== automation.enabled ||
    draft.intervalUnit !== automation.intervalUnit ||
    draft.intervalValue !== automation.intervalValue ||
    draft.message !== automation.message ||
    draft.name.trim() !== automation.name
  );
}
