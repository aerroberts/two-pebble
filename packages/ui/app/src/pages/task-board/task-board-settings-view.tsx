import {
  AppBox,
  Button,
  Input,
  ListLayout,
  type ListLayoutItem,
  Section,
  Select,
  Surface,
} from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';
import { useState } from 'react';
import type { DispatchMode, DispatchSettingsUpdateInput, DispatchSettingsValue } from './use-task-board-page-state';

interface AgentRegistryOption {
  id: string;
  name: string;
}

interface TaskBoardSettingsViewProps {
  boardId: string;
  boardNameDraft: string;
  onBoardNameChange: (value: string) => void;
  onBoardNameSave: () => void;
  pools: TaskPoolRecord[];
  onDeletePool: (poolId: string) => void;
  onDeleteBoard: () => void;
  boardDispatchSettings: DispatchSettingsValue;
  poolDispatchSettings: Record<string, DispatchSettingsValue>;
  agentRegistries: AgentRegistryOption[];
  onSaveDispatchSettings: (input: DispatchSettingsUpdateInput) => void;
}

const DISPATCH_MODE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

export function TaskBoardSettingsView(props: TaskBoardSettingsViewProps) {
  return (
    <>
      <Section compact title="Board name">
        <Input
          aria-label="Board name"
          onBlur={props.onBoardNameSave}
          onChange={(event) => props.onBoardNameChange(event.target.value)}
          placeholder="Untitled board"
          value={props.boardNameDraft}
        />
      </Section>
      <Section compact title="Automation">
        <Surface>
          <DispatchSettingsEditor
            agentRegistries={props.agentRegistries}
            initial={props.boardDispatchSettings}
            onSave={(value) =>
              props.onSaveDispatchSettings({
                scopeKind: 'board',
                scopeId: props.boardId,
                ...value,
              })
            }
          />
        </Surface>
      </Section>
      <Section compact title="Groups">
        <ListLayout
          emptyState="No groups yet."
          items={props.pools.map((pool) =>
            toPoolItem({
              pool,
              onDelete: props.onDeletePool,
              dispatch: props.poolDispatchSettings[pool.id] ?? null,
              agentRegistries: props.agentRegistries,
              onSaveDispatch: (value) =>
                props.onSaveDispatchSettings({
                  scopeKind: 'pool',
                  scopeId: pool.id,
                  ...value,
                }),
            }),
          )}
        />
      </Section>
      <Section compact title="Danger zone">
        <Surface>
          <AppBox variant="delete-row">
            <div>
              <AppBox variant="delete-title">Delete board</AppBox>
              <AppBox variant="delete-description">Permanently removes the board and every task it contains.</AppBox>
            </div>
            <Button leftIcon="trash" onClick={props.onDeleteBoard}>
              Delete board
            </Button>
          </AppBox>
        </Surface>
      </Section>
    </>
  );
}

interface DispatchSettingsEditorProps {
  agentRegistries: AgentRegistryOption[];
  initial: DispatchSettingsValue;
  onSave: (value: DispatchSettingsValue) => void;
}

function DispatchSettingsEditor(props: DispatchSettingsEditorProps) {
  const [concurrency, setConcurrency] = useState<string>(String(props.initial.concurrency));
  const [mode, setMode] = useState<DispatchMode>(props.initial.dispatchMode);
  const [agentId, setAgentId] = useState<string | null>(props.initial.autoAgentRegistryId);
  return (
    <div className="flex flex-col gap-2 p-3">
      <Input
        aria-label="Concurrency"
        label="Concurrency"
        type="number"
        value={concurrency}
        onChange={(event) => setConcurrency(event.target.value)}
        onBlur={() =>
          props.onSave({
            concurrency: Math.max(0, Number.parseInt(concurrency, 10) || 0),
            dispatchMode: mode,
            autoAgentRegistryId: mode === 'automatic' ? agentId : null,
          })
        }
      />
      <Select
        options={DISPATCH_MODE_OPTIONS}
        value={mode}
        onChange={(value: string) => {
          const next = value as DispatchMode;
          setMode(next);
          props.onSave({
            concurrency: Math.max(0, Number.parseInt(concurrency, 10) || 0),
            dispatchMode: next,
            autoAgentRegistryId: next === 'automatic' ? agentId : null,
          });
        }}
      />
      {mode === 'automatic' ? (
        <Select
          placeholder="Pick an agent"
          options={props.agentRegistries.map((entry) => ({ value: entry.id, label: entry.name }))}
          value={agentId ?? undefined}
          onChange={(value: string) => {
            setAgentId(value);
            props.onSave({
              concurrency: Math.max(0, Number.parseInt(concurrency, 10) || 0),
              dispatchMode: mode,
              autoAgentRegistryId: value,
            });
          }}
        />
      ) : null}
    </div>
  );
}

type PoolDeleteHandler = (poolId: string) => void;

interface PoolItemInput {
  pool: TaskPoolRecord;
  onDelete: PoolDeleteHandler;
  dispatch: DispatchSettingsValue | null;
  agentRegistries: AgentRegistryOption[];
  onSaveDispatch: (value: DispatchSettingsValue) => void;
}

function toPoolItem(input: PoolItemInput): ListLayoutItem {
  return {
    key: input.pool.id,
    icon: 'folder',
    title: input.pool.name,
    trailingAccessory: (
      <AppBox variant="controls-row">
        <PoolAutomationToggle
          pool={input.pool}
          agentRegistries={input.agentRegistries}
          dispatch={input.dispatch}
          onSave={input.onSaveDispatch}
        />
        <Button leftIcon="trash" onClick={() => input.onDelete(input.pool.id)}>
          Delete
        </Button>
      </AppBox>
    ),
  };
}

interface PoolAutomationToggleProps {
  pool: TaskPoolRecord;
  agentRegistries: AgentRegistryOption[];
  dispatch: DispatchSettingsValue | null;
  onSave: (value: DispatchSettingsValue) => void;
}

function PoolAutomationToggle(props: PoolAutomationToggleProps) {
  const [open, setOpen] = useState(false);
  const current = props.dispatch ?? {
    concurrency: 0,
    dispatchMode: 'manual' as DispatchMode,
    autoAgentRegistryId: null,
  };
  if (!open) {
    const summary =
      current.dispatchMode === 'automatic'
        ? `auto · ${current.concurrency}`
        : current.concurrency > 0
          ? `manual · ${current.concurrency}`
          : 'manual';
    return (
      <Button leftIcon="settings" onClick={() => setOpen(true)} variant="secondary">
        {summary}
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <DispatchSettingsEditor
        agentRegistries={props.agentRegistries}
        initial={current}
        onSave={(value) => {
          props.onSave(value);
          setOpen(false);
        }}
      />
      <Button onClick={() => setOpen(false)} variant="secondary">
        Close
      </Button>
    </div>
  );
}
