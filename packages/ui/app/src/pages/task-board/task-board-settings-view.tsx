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
import type {
  AgentRegistryRecord,
  InferenceProfileRecord,
  LoadableRegistry,
  TaskPoolRecord,
} from '@two-pebble/realtime';
import { useTemplateDeliverables } from '@two-pebble/realtime';
import { useState } from 'react';
import { agentRegistryIcon } from '../../shared/agents/agent-registry-icon';
import type { DispatchMode, DispatchSettingsUpdateInput, DispatchSettingsValue } from './use-task-board-page-state';

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
  agentRegistries: AgentRegistryRecord[];
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
  onSaveDispatchSettings: (input: DispatchSettingsUpdateInput) => void;
  templates: Array<{ id: string; name: string; prompt: string }>;
  onCreateTemplate: (input: { name: string; prompt?: string }) => void;
  onUpdateTemplate: (input: { id: string; name?: string; prompt?: string }) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplateDeliverable: (input: {
    templateId: string;
    name: string;
    description?: string;
    type: 'text' | 'pr_url';
    orderIndex?: number;
  }) => void;
  onUpdateTemplateDeliverable: (input: {
    id: string;
    name?: string;
    description?: string;
    type?: 'text' | 'pr_url';
    orderIndex?: number;
  }) => void;
  onDeleteTemplateDeliverable: (id: string) => void;
}

const DISPATCH_MODE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

const DELIVERABLE_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'pr_url', label: 'PR URL' },
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
            inferenceProfiles={props.inferenceProfiles}
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
      <Section compact title="Task templates">
        <div className="flex justify-end pb-2">
          <Button leftIcon="plus" onClick={() => props.onCreateTemplate({ name: 'New template', prompt: '' })}>
            Add template
          </Button>
        </div>
        <ListLayout
          emptyState="No task templates yet."
          items={props.templates.map((template) => ({
            key: template.id,
            icon: 'file-text',
            title: template.name,
            trailingAccessory: (
              <TaskTemplateEditor
                template={template}
                onUpdateTemplate={props.onUpdateTemplate}
                onDeleteTemplate={props.onDeleteTemplate}
                onCreateDeliverable={props.onCreateTemplateDeliverable}
                onUpdateDeliverable={props.onUpdateTemplateDeliverable}
                onDeleteDeliverable={props.onDeleteTemplateDeliverable}
              />
            ),
          }))}
        />
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
              inferenceProfiles: props.inferenceProfiles,
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

interface TaskTemplateEditorProps {
  template: { id: string; name: string; prompt: string };
  onUpdateTemplate: TaskBoardSettingsViewProps['onUpdateTemplate'];
  onDeleteTemplate: TaskBoardSettingsViewProps['onDeleteTemplate'];
  onCreateDeliverable: TaskBoardSettingsViewProps['onCreateTemplateDeliverable'];
  onUpdateDeliverable: TaskBoardSettingsViewProps['onUpdateTemplateDeliverable'];
  onDeleteDeliverable: TaskBoardSettingsViewProps['onDeleteTemplateDeliverable'];
}

function TaskTemplateEditor(props: TaskTemplateEditorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(props.template.name);
  const [prompt, setPrompt] = useState(props.template.prompt);
  const { deliverables } = useTemplateDeliverables({ templateId: open ? props.template.id : '' });
  if (!open) {
    return (
      <Button leftIcon="chevron-right" onClick={() => setOpen(true)} variant="secondary">
        Edit
      </Button>
    );
  }
  return (
    <div className="flex min-w-[28rem] flex-col gap-2">
      <Input
        aria-label="Template name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => props.onUpdateTemplate({ id: props.template.id, name: name.trim() || props.template.name })}
      />
      <textarea
        aria-label="Template prompt"
        className="block min-h-24 w-full resize-y rounded-md border border-border bg-surface-neutral px-3 py-2 text-sm leading-5 text-content outline-none placeholder:text-content-subtle focus:border-strong"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={() => props.onUpdateTemplate({ id: props.template.id, prompt })}
        placeholder="Additional system prompt"
      />
      <div className="flex items-center justify-between">
        <AppBox variant="muted-xs">Deliverables</AppBox>
        <Button
          leftIcon="plus"
          onClick={() =>
            props.onCreateDeliverable({
              templateId: props.template.id,
              name: 'New deliverable',
              type: 'text',
              orderIndex: deliverables.length,
            })
          }
        >
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {deliverables.map((deliverable) => (
          <div key={deliverable.id} className="grid grid-cols-[1fr_1fr_8rem_auto] items-end gap-2">
            <Input
              aria-label="Deliverable name"
              label="Name"
              value={deliverable.name}
              onChange={(event) => props.onUpdateDeliverable({ id: deliverable.id, name: event.target.value })}
            />
            <Input
              aria-label="Deliverable description"
              label="Description"
              value={deliverable.description}
              onChange={(event) => props.onUpdateDeliverable({ id: deliverable.id, description: event.target.value })}
            />
            <Select
              options={DELIVERABLE_TYPE_OPTIONS}
              value={deliverable.type}
              onChange={(value) => props.onUpdateDeliverable({ id: deliverable.id, type: value as 'text' | 'pr_url' })}
            />
            <Button leftIcon="trash" onClick={() => props.onDeleteDeliverable(deliverable.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <AppBox variant="controls-row">
        <Button onClick={() => setOpen(false)} variant="secondary">
          Close
        </Button>
        <Button leftIcon="trash" onClick={() => props.onDeleteTemplate(props.template.id)}>
          Delete template
        </Button>
      </AppBox>
    </div>
  );
}

interface DispatchSettingsEditorProps {
  agentRegistries: AgentRegistryRecord[];
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
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
          options={props.agentRegistries.map((entry) => ({
            icon: agentRegistryIcon(entry, props.inferenceProfiles),
            label: entry.name,
            value: entry.id,
          }))}
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
  agentRegistries: AgentRegistryRecord[];
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
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
          inferenceProfiles={input.inferenceProfiles}
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
  agentRegistries: AgentRegistryRecord[];
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
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
        inferenceProfiles={props.inferenceProfiles}
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
